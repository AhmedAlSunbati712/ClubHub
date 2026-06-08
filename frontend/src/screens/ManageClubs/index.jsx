// Noah Larbalestier, CS61, Spring 2026
// admin screen for managing clubs — list, delete, and create clubs
// used Claude to assist with implementation and debugging

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Type, AlignLeft, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useClubs, useDeleteClub, useCreateClub } from '../../api/clubs.ts';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import ClubTable from '../../components/admin/ClubTable.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';

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

const EMPTY_FORM = { name: '', category: '', description: '' };

// Image 2 — Manage Clubs.
export default function ManageClubs() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM });
  const [createErrors, setCreateErrors] = useState({});

  const { data: clubs = [], isLoading, isError } = useClubs();
  const { mutate: deleteClub } = useDeleteClub();
  const { mutate: createClub, isPending: isCreating } = useCreateClub();

  const setCreate = (key, value) => {
    setCreateForm((f) => ({ ...f, [key]: value }));
    setCreateErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateCreate = () => {
    const next = {};
    if (!createForm.name.trim()) next.name = 'Name is required';
    if (!createForm.category) next.category = 'Select a category';
    if (!createForm.description.trim()) next.description = 'Add a short description';
    setCreateErrors(next);
    return Object.keys(next).length === 0;
  };

  const closeCreate = () => {
    setCreateForm({ ...EMPTY_FORM });
    setCreateErrors({});
    setCreateOpen(false);
  };

  const submitCreate = (e) => {
    e.preventDefault();
    if (!validateCreate()) return;
    createClub(
      { name: createForm.name.trim(), category: createForm.category, description: createForm.description.trim(), status: 'Active' },
      {
        onSuccess: () => { toast.success(`Club "${createForm.name.trim()}" created`); closeCreate(); },
        onError: (error) => {
          const message = error?.response?.data?.Error || error?.response?.data?.errors?.[0]?.msg || 'Failed to create club';
          toast.error(message);
        },
      },
    );
  };

  const errorMessage = (error, fallback) => error?.response?.data?.Error || fallback;

  const handleEdit = (id) => navigate(`/clubs/${id}/manage`);

  const handleDelete = async (id) => {
    const club = clubs.find((c) => c.id === id);
    const ok = await confirm({
      title: 'Delete club?',
      message: `${club?.name ?? 'This club'} and its memberships will be permanently removed.`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    deleteClub(id, {
      onSuccess: () => toast.info(`${club?.name ?? 'Club'} deleted`),
      onError: (error) => toast.error(errorMessage(error, 'Failed to delete club')),
    });
  };

  if (isLoading) {
    return (
      <div className="container page">
        <p className="empty-state">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container page">
        <p className="empty-state">Failed to load clubs.</p>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div className="page-head__back">
          <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div className="page-head__titles">
            <h1 className="page-title">Manage Clubs</h1>
            <p className="page-subtitle">{clubs.length} total clubs registered</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          Create New Club
        </Button>
      </div>

      <ClubTable clubs={clubs} onEdit={handleEdit} onDelete={handleDelete} />

      <Modal open={createOpen} onClose={closeCreate} title="Create New Club" labelledBy="create-club-title">
        <form className="form" onSubmit={submitCreate} noValidate>
          <label className={`field${createErrors.name ? ' field--error' : ''}`}>
            <span className="field__label">Club name</span>
            <span className="field__control">
              <Type className="field__icon" size={17} />
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreate('name', e.target.value)}
                placeholder="Club name"
              />
            </span>
            {createErrors.name && <span className="field__error">{createErrors.name}</span>}
          </label>

          <label className={`field${createErrors.category ? ' field--error' : ''}`}>
            <span className="field__label">Category</span>
            <span className="field__control field__control--select">
              <select value={createForm.category} onChange={(e) => setCreate('category', e.target.value)}>
                <option value="">Select a category…</option>
                {CLUB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="field__chevron" size={16} />
            </span>
            {createErrors.category && <span className="field__error">{createErrors.category}</span>}
          </label>

          <label className={`field${createErrors.description ? ' field--error' : ''}`}>
            <span className="field__label">Description</span>
            <span className="field__control field__control--area">
              <AlignLeft className="field__icon field__icon--top" size={17} />
              <textarea
                rows={3}
                value={createForm.description}
                onChange={(e) => setCreate('description', e.target.value)}
                placeholder="What is this club about?"
              />
            </span>
            {createErrors.description && <span className="field__error">{createErrors.description}</span>}
          </label>

          <div className="modal__actions">
            <Button variant="secondary" type="button" onClick={closeCreate}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Club'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
