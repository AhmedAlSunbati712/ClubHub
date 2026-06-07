import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useClubs, useDeleteClub } from '../../api/clubs.ts';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import ClubTable from '../../components/admin/ClubTable.jsx';
import Button from '../../components/common/Button.jsx';

// Image 2 — Manage Clubs.
export default function ManageClubs() {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data: clubs = [], isLoading, isError } = useClubs();
  const { mutate: deleteClub } = useDeleteClub();

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
        <Button variant="primary" onClick={() => toast.info('Create club form coming soon')}>
          <Plus size={16} />
          Create New Club
        </Button>
      </div>

      <ClubTable clubs={clubs} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
