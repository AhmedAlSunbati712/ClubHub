import { MapPin, Pencil, Trash2 } from 'lucide-react';

// Building/Room/Capacity table.
export default function LocationTable({ locations = [], onEdit, onDelete }) {
  return (
    <div className="card table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Building</th>
            <th>Room</th>
            <th className="col-num">Capacity</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.id}>
              <td>
                <span className="loc-cell">
                  <MapPin />
                  {loc.building}
                </span>
              </td>
              <td>{loc.room}</td>
              <td className="col-num">{loc.capacity} seats</td>
              <td className="col-actions">
                <span className="cell-actions">
                  <button
                    type="button"
                    className="icon-btn icon-btn--edit"
                    aria-label={`Edit ${loc.building} ${loc.room}`}
                    onClick={() => onEdit?.(loc.id)}
                  >
                    <Pencil />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--delete"
                    aria-label={`Delete ${loc.building} ${loc.room}`}
                    onClick={() => onDelete?.(loc.id)}
                  >
                    <Trash2 />
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
