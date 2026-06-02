import { MapPin } from 'lucide-react';

// building card (rooms + seats).
export default function LocationCard({ building }) {
  if (!building) return null;
  const total = building.rooms.reduce((sum, r) => sum + r.seats, 0);

  return (
    <article className="card loc-card">
      <div className="loc-card__head">
        <span className="icon-tile">
          <MapPin />
        </span>
        <div>
          <h3 className="loc-card__name">{building.name}</h3>
          <span className="loc-card__meta">
            {building.rooms.length} {building.rooms.length === 1 ? 'room' : 'rooms'} ·{' '}
            {total} capacity
          </span>
        </div>
      </div>
      {building.rooms.map((room) => (
        <div className="loc-room" key={room.id}>
          <span>{room.name}</span>
          <span className="loc-room__seats">{room.seats} seats</span>
        </div>
      ))}
    </article>
  );
}
