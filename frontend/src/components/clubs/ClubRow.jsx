import { Link } from 'react-router-dom';
import { Users, Pencil, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import { ROUTES } from '../../constants/routes.js';

// row in admin Manage Clubs table.
export default function ClubRow({ club, onEdit, onDelete }) {
  if (!club) return null;
  return (
    <tr className="club-row">
      <td>
        <span className="cell-user">
          <span className="icon-tile" style={{ width: 36, height: 36 }}>
            <Users size={18} />
          </span>
          <Link to={ROUTES.CLUB_DETAIL.replace(':clubId', club.id)}>{club.name}</Link>
        </span>
      </td>
      <td>
        <span className="pill pill-category">{club.category}</span>
      </td>
      <td className="col-num">{club.memberCount}</td>
      <td>
        {club.president ? (
          <span className="cell-user">
            <Avatar name={club.president.name} size="sm" />
            {club.president.name}
          </span>
        ) : (
          <span className="muted" style={{ fontStyle: 'italic' }}>
            Not assigned
          </span>
        )}
      </td>
      <td className="col-actions">
        <span className="cell-actions">
          <button
            type="button"
            className="icon-btn icon-btn--edit"
            aria-label={`Edit ${club.name}`}
            onClick={() => onEdit?.(club.id)}
          >
            <Pencil />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--delete"
            aria-label={`Delete ${club.name}`}
            onClick={() => onDelete?.(club.id)}
          >
            <Trash2 />
          </button>
        </span>
      </td>
    </tr>
  );
}
