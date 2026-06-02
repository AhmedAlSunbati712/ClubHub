import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useLocations } from '../../hooks/useLocations.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import LocationCard from '../../components/admin/LocationCard.jsx';
import LocationTable from '../../components/admin/LocationTable.jsx';
import Button from '../../components/common/Button.jsx';

// Image 5 — Manage Locations.
export default function ManageLocations() {
  const navigate = useNavigate();
  const { locations, buildings } = useLocations();
  const { toast } = useToast();
  const confirm = useConfirm();
  const totalCapacity = locations.reduce((sum, l) => sum + l.capacity, 0);

  const handleEdit = (id) => {
    const loc = locations.find((l) => l.id === id);
    toast(`Editing ${loc?.building} ${loc?.room} — form coming soon`, { variant: 'info' });
  };
  const handleDelete = async (id) => {
    const loc = locations.find((l) => l.id === id);
    const ok = await confirm({
      title: 'Delete location?',
      message: `${loc?.building} · ${loc?.room} will be removed and unavailable for events.`,
      confirmLabel: 'Delete',
    });
    if (ok) toast(`${loc?.building} ${loc?.room} deleted`, { variant: 'info' });
  };

  return (
    <div className="container page">
      <div className="page-head">
        <div className="page-head__back">
          <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div className="page-head__titles">
            <h1 className="page-title">Manage Locations</h1>
            <p className="page-subtitle">
              {locations.length} locations · {buildings.length} buildings · {totalCapacity} total capacity
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={() => toast('Add location form coming soon', { variant: 'info' })}>
          <Plus size={16} />
          Add New Location
        </Button>
      </div>

      <div className="loc-cards">
        {buildings.map((b) => (
          <LocationCard key={b.id} building={b} />
        ))}
      </div>

      <LocationTable locations={locations} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
