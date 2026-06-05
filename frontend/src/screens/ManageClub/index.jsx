import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useClub } from '../../hooks/useClubs.js';
import { useMembership } from '../../hooks/useMembership.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { Inbox } from 'lucide-react';
import RoleBadge from '../../components/common/RoleBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { formatDate } from '../../utils/format.js';

// Images 9, 10, 11 — tabbed: Members / Pending / Settings.
export default function ManageClub() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { club } = useClub(clubId);
  const { members, pending } = useMembership(clubId);
  const { toast } = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('members');

  const handleApprove = (p) => toast(`Approved ${p.name}'s application`);
  const handleReject = async (p) => {
    const ok = await confirm({
      title: 'Reject application?',
      message: `${p.name}'s request to join will be declined.`,
      confirmLabel: 'Reject',
    });
    if (ok) toast(`Rejected ${p.name}'s application`, { variant: 'info' });
  };
  const handleRemove = async (m) => {
    const ok = await confirm({
      title: 'Remove member?',
      message: `${m.name} will be removed from ${club?.name ?? 'this club'}.`,
      confirmLabel: 'Remove',
    });
    if (ok) toast(`Removed ${m.name}`, { variant: 'info' });
  };
  const handleInvite = () => toast('Invite flow coming soon', { variant: 'info' });
  const handleEdit = () => toast('Edit form coming soon', { variant: 'info' });
  const handleDeactivate = async () => {
    const ok = await confirm({
      title: 'Deactivate club?',
      message: `${club?.name ?? 'This club'} will be hidden and members notified. This can be undone by an admin.`,
      confirmLabel: 'Deactivate',
    });
    if (ok) toast(`${club?.name ?? 'Club'} deactivated`, { variant: 'info' });
  };

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
                    <tr key={m.id}>
                      <td>
                        <span className="cell-user">
                          <Avatar name={m.name} size="sm" muted />
                          {m.name}
                        </span>
                      </td>
                      <td className="muted">{m.email}</td>
                      <td>
                        <RoleBadge role={m.role} />
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
                      <tr key={p.id}>
                        <td>
                          <span className="cell-user">
                            <Avatar name={p.name} size="sm" muted />
                            {p.name}
                          </span>
                        </td>
                        <td className="muted">{p.email}</td>
                        <td className="tnum">{formatDate(p.appliedOn)}</td>
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
              <div className="settings-field__label">Description</div>
              <div className="settings-field__value">{club?.description}</div>
            </div>
            <Button variant="secondary" onClick={handleEdit}>
              Edit Club Information
            </Button>

            <div className="danger-zone">
              <div className="danger-zone__title">Danger Zone</div>
              <Button variant="danger" onClick={handleDeactivate}>
                Deactivate Club
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
