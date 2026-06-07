import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import LocationCard from '../../components/admin/LocationCard.jsx';
import LocationTable from '../../components/admin/LocationTable.jsx';
import CreateLocationModal from '../../components/admin/CreateLocationModal.jsx';
import EditLocationModal from '../../components/admin/EditLocationModal.jsx';
import Button from '../../components/common/Button.jsx';
import { useCreateLocation, useDeleteLocation, useLocations, useUpdateLocation } from '../../api/locations.ts';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState.jsx';
import { MapPin } from 'lucide-react';


export default function ManageLocations() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { data: locations = [], isLoading: isLoadingLocations, isError: isErrorLocations } = useLocations();
  const { mutate: createLocation, isPending: isCreatingLocation } = useCreateLocation(() => {
    toast.success('Location created!');
    setCreateOpen(false);
  });
  const { mutate: updateLocation, isPending: isUpdatingLocation } = useUpdateLocation(() => {
    toast.success('Location updated!');
    setEditOpen(false);
    setSelectedLocation(null);
  });
  const { mutate: deleteLocation } = useDeleteLocation(() => {
    toast.success('Location deleted!');
  });
  const totalCapacity = locations.reduce((sum, l) => sum + l.capacity, 0);

  const buildings = useMemo(() => {
    const grouped = new Map();

    locations.forEach((location) => {
      if (!grouped.has(location.building)) {
        grouped.set(location.building, {
          id: location.building.toLowerCase().replace(/\s+/g, '-'),
          name: location.building,
          rooms: [],
        });
      }

      grouped.get(location.building).rooms.push({
        id: String(location.id),
        name: location.room,
        seats: location.capacity,
      });
    });

    return Array.from(grouped.values());
  }, [locations]);

  const handleEdit = (id) => {
    const loc = locations.find((l) => l.id === id);
    if (!loc) return;
    setSelectedLocation(loc);
    setEditOpen(true);
  };
  const handleDelete = async (id) => {
    const loc = locations.find((l) => l.id === id);
    const ok = await confirm({
      title: 'Delete location?',
      message: `${loc?.building} · ${loc?.room} will be removed and unavailable for events.`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;

    deleteLocation(id, {
      onError: (error) => {
        const message =
          error?.response?.data?.Error ||
          error?.response?.data?.errors?.[0]?.msg ||
          'Failed to delete location!';
        toast.error(message);
      },
    });
  };

  const normalizeBuildingAndRoom = (name) =>
    name
      .toLowerCase()
      .split(' ')
      .map((word) => {
        if (!word) return '';
        if (word.length <= 2) return word;
        return word[0].toUpperCase() + word.slice(1);
      })
      .join(' ');

  const handleCreate = (payload) => {
    if (!payload.building || !payload.room || !payload.capacity) {
      toast.error('Fill in the empty fields!');
      return;
    }

    createLocation(
      {
        building: normalizeBuildingAndRoom(payload.building.trim()),
        room: normalizeBuildingAndRoom(payload.room.trim()),
        capacity: payload.capacity,
      },
      {
        onError: (error) => {
          const message =
            error?.response?.data?.Error ||
            error?.response?.data?.errors?.[0]?.msg ||
            'Failed to create location!';
          toast.error(message);
        },
      },
    );
  };

  const handleUpdate = (payload) => {
    if (!selectedLocation) return;
    if (!payload.building || !payload.room || !payload.capacity) {
      toast.error('Fill in the empty fields!');
      return;
    }

    updateLocation(
      {
        locationId: selectedLocation.id,
        payload: {
          building: normalizeBuildingAndRoom(payload.building.trim()),
          room: normalizeBuildingAndRoom(payload.room.trim()),
          capacity: payload.capacity,
        },
      },
      {
        onError: (error) => {
          const message =
            error?.response?.data?.Error ||
            error?.response?.data?.errors?.[0]?.msg ||
            'Failed to update location!';
          toast.error(message);
        },
      },
    );
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
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          Create Location
        </Button>
      </div>

      {isLoadingLocations ? (
        <EmptyState icon={MapPin} title="Loading locations" hint="Fetching rooms and capacities..." />
      ) : isErrorLocations ? (
        <EmptyState icon={MapPin} title="Unable to load locations" hint="Try refreshing the page." />
      ) : (
        <>
          <div className="loc-cards">
            {buildings.map((b) => (
              <LocationCard key={b.id} building={b} />
            ))}
          </div>

          <LocationTable locations={locations} onEdit={handleEdit} onDelete={handleDelete} />
        </>
      )}

      <CreateLocationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreatingLocation}
      />
      <EditLocationModal
        open={editOpen}
        location={selectedLocation}
        onClose={() => {
          setEditOpen(false);
          setSelectedLocation(null);
        }}
        onSubmit={handleUpdate}
        isSubmitting={isUpdatingLocation}
      />
    </div>
  );
}
