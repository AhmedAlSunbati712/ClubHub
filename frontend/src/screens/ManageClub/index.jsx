// Noah Larbalestier, CS61, Spring 2026
// officer screen for managing a single club — members, pending applications, and club info
// used Claude to assist with implementation and debugging

import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, CheckCircle2, XCircle, Inbox, Type, AlignLeft, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useClub, useUpdateClub } from '../../api/clubs.ts';
import {
  useClubMemberships,
  useUpdateMembership,
  useDeleteMembership,
} from '../../api/membership.ts';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import RoleBadge from '../../components/common/RoleBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { formatDate } from '../../utils/format.js';

const CLUB_ROLES = ['Member', 'Officer', 'President'];

const CLUB_CATEGORIES = [
  'Academic',
  'Arts & Performance',
  'Cultural & Identity',
  'Community Service',
  'Sports & Recreation',
  'Political & Advocacy',
  'Religious & Spiritual',
  'Professional & Career',
  'Greek Life',
  'Media & Publications',
  'Other',
];

// Images 9, 10, 11 — tabbed: Members / Pending / Settings.
export default function ManageClub() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { user } = useAuth();
  const [tab, setTab] = useState('members');
  // bumped to remount the role <select> back to server truth on cancel/error
  const [roleVersion, setRoleVersion] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category: '', description: '' });
  const [editErrors, setEditErrors] = useState({});

  const {
    data: club,
    isLoading: isLoadingClub,
    isError: isErrorClub,
  } = useClub(clubId);
  const {
    data: memberships,
    isLoading: isLoadingMemberships,
    isError: isErrorMemberships,
  } = useClubMemberships(clubId);
  const { mutate: updateMembership } = useUpdateMembership();
  const { mutate: deleteMembership } = useDeleteMembership();
  const { mutate: updateClub, isPending: isSavingClub } = useUpdateClub();

  const members = useMemo(
    () => (memberships ?? []).filter((membership) => membership.status === 'Active'),
    [memberships],
  );
  const pending = useMemo(
    () => (memberships ?? []).filter((membership) => membership.status === 'Pending'),
    [memberships],
  );

  // role-change permissions: admins assign any role; the club president assigns
  // officer/member; officers can't change roles (read-only badge for them).
  const isPlatformAdmin = user?.role === 'Admin';
  const isClubPresident = useMemo(
    () => (memberships ?? []).some((m) => String(m.userId) === String(user?.id) && m.role === 'President'),
    [memberships, user?.id],
  );
  const canChangeRoles = isPlatformAdmin || isClubPresident;

  const roleOptionsFor = (currentRole) => {
    const allowed = isPlatformAdmin ? CLUB_ROLES : ['Member', 'Officer'];
    return allowed.includes(currentRole) ? allowed : [currentRole, ...allowed];
  };

  useEffect(() => {
    if (club && editOpen) {
      setEditForm({ name: club.name ?? '', category: club.category ?? '', description: club.description ?? '' });
      setEditErrors({});
    }
  }, [editOpen, club]);

  const setEdit = (key, value) => {
    setEditForm((f) => ({ ...f, [key]: value }));
    setEditErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateEdit = () => {
    const next = {};
    if (!editForm.name.trim()) next.name = 'Name is required';
    if (!editForm.category) next.category = 'Select a category';
    if (!editForm.description.trim()) next.description = 'Add a short description';
    setEditErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!validateEdit()) return;
    updateClub(
      { clubId, payload: { name: editForm.name.trim(), category: editForm.category, description: editForm.description.trim() } },
      {
        onSuccess: () => { toast.success('Club info updated'); setEditOpen(false); },
        onError: (error) => toast.error(errorMessage(error, 'Failed to update club')),
      },
    );
  };

  const errorMessage = (error, fallback) => error?.response?.data?.Error || fallback;

  const handleApprove = (applicant) => {
    updateMembership(
      { clubId, userId: applicant.userId, payload: { status: 'Active' } },
      {
        onSuccess: () => toast.success(`Approved ${applicant.name || 'the applicant'}`),
        onError: (error) => toast.error(errorMessage(error, 'Failed to approve application')),
      },
    );
  };

  const handleRoleChange = async (member, role) => {
    if (role === member.role) return;
    if (role === 'President') {
      const ok = await confirm({
        title: 'Make president?',
        message: `${member.name || 'This member'} will become president of ${club?.name ?? 'this club'}. The current president, if any, will be demoted to officer.`,
        confirmLabel: 'Make President',
      });
      if (!ok) {
        setRoleVersion((v) => v + 1);
        return;
      }
    }
    updateMembership(
      { clubId, userId: member.userId, payload: { role } },
      {
        onSuccess: () => toast.success(`${member.name || 'Member'} is now ${role.toLowerCase()}`),
        onError: (error) => {
          setRoleVersion((v) => v + 1);
          toast.error(errorMessage(error, 'Failed to update role'));
        },
      },
    );
  };

  const handleReject = async (applicant) => {
    const ok = await confirm({
      title: 'Reject application?',
      message: `${applicant.name || 'This applicant'}'s request to join will be declined.`,
      confirmLabel: 'Reject',
    });
    if (!ok) return;
    deleteMembership(
      { clubId, userId: applicant.userId },
      {
        onSuccess: () => toast.info(`Rejected ${applicant.name || 'the applicant'}`),
        onError: (error) => toast.error(errorMessage(error, 'Failed to reject application')),
      },
    );
  };

  const handleRemove = async (member) => {
    const ok = await confirm({
      title: 'Remove member?',
      message: `${member.name || 'This member'} will be removed from ${club?.name ?? 'this club'}.`,
      confirmLabel: 'Remove',
    });
    if (!ok) return;
    deleteMembership(
      { clubId, userId: member.userId },
      {
        onSuccess: () => toast.info(`Removed ${member.name || 'member'}`),
        onError: (error) => toast.error(errorMessage(error, 'Failed to remove member')),
      },
    );
  };

  const handleInvite = () => toast.info('Invite flow coming soon');

  const handleEdit = () => setEditOpen(true);

  const handleToggleStatus = async () => {
    const isInactive = club?.status === 'Inactive';
    const nextStatus = isInactive ? 'Active' : 'Inactive';
    const ok = await confirm({
      title: isInactive ? 'Reactivate club?' : 'Deactivate club?',
      message: isInactive
        ? `${club?.name ?? 'This club'} will be visible to students again.`
        : `${club?.name ?? 'This club'} will be hidden from students. This cannot be done while it has upcoming events.`,
      confirmLabel: isInactive ? 'Reactivate' : 'Deactivate',
    });
    if (!ok) return;
    updateClub(
      { clubId, payload: { status: nextStatus } },
      {
        onSuccess: () => toast.success(`${club?.name ?? 'Club'} ${isInactive ? 'reactivated' : 'deactivated'}`),
        onError: (error) => toast.error(errorMessage(error, 'Failed to update club status')),
      },
    );
  };

  if (isLoadingClub || isLoadingMemberships) {
    return (
      <div className="container page">
        <p className="empty-state">Loading...</p>
      </div>
    );
  }

  if (isErrorClub || isErrorMemberships) {
    return (
      <div className="container page">
        <p className="empty-state">Failed to load club.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'members', label: `Members (${members.length})` },
    { id: 'pending', label: `Pending Applications (${pending.length})` },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="container page">
      <div className="page-head__back" style={{ marginBottom: 'var(--space-8)' }}>
        <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={18} />
        </button>
        <h1 className="page-title">Manage {club?.name ?? 'Club'}</h1>
      </div>

      <section className="card card-pad">
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'members' && (
          <>
            <div className="card-header">
              <h2 className="section-title">Active Members</h2>
              <Button variant="secondary" onClick={handleInvite}>
                <UserPlus size={16} />
                Invite Member
              </Button>
            </div>
            {members.length === 0 ? (
              <EmptyState icon={Inbox} title="No active members" hint="Approved members will appear here." />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Join Date</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.userId}>
                        <td>
                          <span className="cell-user">
                            <Avatar name={m.name} size="sm" muted />
                            {m.name}
                          </span>
                        </td>
                        <td className="muted">{m.email}</td>
                        <td>
                          {canChangeRoles ? (
                            <select
                              key={`${m.userId}-${m.role}-${roleVersion}`}
                              className="role-select"
                              value={m.role}
                              onChange={(e) => handleRoleChange(m, e.target.value)}
                              aria-label={`Change role for ${m.name}`}
                            >
                              {roleOptionsFor(m.role).map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <RoleBadge role={m.role} />
                          )}
                        </td>
                        <td className="tnum">{formatDate(m.joinDate)}</td>
                        <td className="col-actions">
                          <button
                            type="button"
                            className="icon-btn icon-btn--delete"
                            aria-label={`Remove ${m.name}`}
                            onClick={() => handleRemove(m)}
                          >
                            <Trash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'pending' && (
          <>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-5)' }}>
              Pending Applications
            </h2>
            {pending.length === 0 ? (
              <EmptyState icon={Inbox} title="No pending applications" hint="New join requests will appear here." />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Email</th>
                      <th>Applied On</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((p) => (
                      <tr key={p.userId}>
                        <td>
                          <span className="cell-user">
                            <Avatar name={p.name} size="sm" muted />
                            {p.name}
                          </span>
                        </td>
                        <td className="muted">{p.email}</td>
                        <td className="tnum">{formatDate(p.joinDate)}</td>
                        <td className="col-actions">
                          <span className="cell-actions">
                            <Button variant="success" className="btn-sm" onClick={() => handleApprove(p)}>
                              <CheckCircle2 size={15} />
                              Approve
                            </Button>
                            <Button variant="danger" className="btn-sm" onClick={() => handleReject(p)}>
                              <XCircle size={15} />
                              Reject
                            </Button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'settings' && (
          <>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-5)' }}>
              Club Settings
            </h2>
            <div className="settings-field">
              <div className="settings-field__label">Club Name</div>
              <div className="settings-field__value">{club?.name}</div>
            </div>
            <div className="settings-field">
              <div className="settings-field__label">Category</div>
              <span className="pill">{club?.category}</span>
            </div>
            <div className="settings-field">
              <div className="settings-field__label">Status</div>
              <span className={`pill${club?.status === 'Inactive' ? ' pill--danger' : ''}`}>{club?.status}</span>
            </div>
            <div className="settings-field">
              <div className="settings-field__label">Description</div>
              <div className="settings-field__value">{club?.description}</div>
            </div>
            <Button variant="secondary" onClick={handleEdit}>
              Edit Club Information
            </Button>

            <div className="danger-zone">
              <div className="danger-zone__title">Danger Zone</div>
              <Button variant={club?.status === 'Inactive' ? 'success' : 'danger'} onClick={handleToggleStatus}>
                {club?.status === 'Inactive' ? 'Reactivate Club' : 'Deactivate Club'}
              </Button>
            </div>
          </>
        )}
      </section>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Club Information" labelledBy="edit-club-title">
        <form className="form" onSubmit={submitEdit} noValidate>
          <label className={`field${editErrors.name ? ' field--error' : ''}`}>
            <span className="field__label">Club name</span>
            <span className="field__control">
              <Type className="field__icon" size={17} />
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEdit('name', e.target.value)}
                placeholder="Club name"
              />
            </span>
            {editErrors.name && <span className="field__error">{editErrors.name}</span>}
          </label>

          <label className={`field${editErrors.category ? ' field--error' : ''}`}>
            <span className="field__label">Category</span>
            <span className="field__control field__control--select">
              <select value={editForm.category} onChange={(e) => setEdit('category', e.target.value)}>
                <option value="">Select a category…</option>
                {CLUB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="field__chevron" size={16} />
            </span>
            {editErrors.category && <span className="field__error">{editErrors.category}</span>}
          </label>

          <label className={`field${editErrors.description ? ' field--error' : ''}`}>
            <span className="field__label">Description</span>
            <span className="field__control field__control--area">
              <AlignLeft className="field__icon field__icon--top" size={17} />
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEdit('description', e.target.value)}
                placeholder="What is this club about?"
              />
            </span>
            {editErrors.description && <span className="field__error">{editErrors.description}</span>}
          </label>

          <div className="modal__actions">
            <Button variant="secondary" type="button" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSavingClub}>
              {isSavingClub ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
