import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useClubs } from '../../hooks/useClubs.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import ClubTable from '../../components/admin/ClubTable.jsx';
import Button from '../../components/common/Button.jsx';

// Image 2 — Manage Clubs.
export default function ManageClubs() {
  const navigate = useNavigate();
  const { clubs } = useClubs();
  const { toast } = useToast();
  const confirm = useConfirm();

  const handleEdit = (id) => {
    const club = clubs.find((c) => c.id === id);
    toast(`Editing ${club?.name ?? 'club'} — form coming soon`, { variant: 'info' });
  };
  const handleDelete = async (id) => {
    const club = clubs.find((c) => c.id === id);
    const ok = await confirm({
      title: 'Delete club?',
      message: `${club?.name ?? 'This club'} and its memberships will be permanently removed.`,
      confirmLabel: 'Delete',
    });
    if (ok) toast(`${club?.name ?? 'Club'} deleted`, { variant: 'info' });
  };

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
        <Button variant="primary" onClick={() => toast('Create club form coming soon', { variant: 'info' })}>
          <Plus size={16} />
          Create New Club
        </Button>
      </div>

      <ClubTable clubs={clubs} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
