import { Link } from 'react-router-dom';
import { Users, User } from 'lucide-react';
import RoleBadge from '../common/RoleBadge.jsx';
import Button from '../common/Button.jsx';
import { ROUTES } from '../../constants/routes.js';

// Browse Clubs card.
export default function ClubCard({ club, onApply }) {
  if (!club) return null;
  const canManage = club.viewerRole === 'Officer' || club.viewerRole === 'President';
  const isPending = club.viewerStatus === 'Pending';
  const isActiveMember = Boolean(club.viewerRole) && club.viewerStatus === 'Active';
  const hasMembership = Boolean(club.viewerRole);

  return (
    <article className="card card-interactive club-card">
      <div className="club-card__head">
        <span className="icon-tile">
          <Users />
        </span>
        <div>
          <h3 className="club-card__title">
            <Link to={ROUTES.CLUB_DETAIL.replace(':clubId', club.id)}>{club.name}</Link>
          </h3>
          <div className="club-card__badges">
            {isActiveMember && <RoleBadge role={club.viewerRole} />}
            {isPending && <span className="pill">Pending</span>}
            <span className="pill pill-category">{club.category}</span>
          </div>
        </div>
      </div>

      <p className="club-card__desc">{club.description}</p>

      <span className="meta-row">
        <User />
        {club.memberCount} members
      </span>

      <div className="club-card__actions">
        <Link to={ROUTES.CLUB_DETAIL.replace(':clubId', club.id)} className="btn btn-secondary btn-block">
          View Details
        </Link>
        {canManage && (
          <Link
            to={ROUTES.MANAGE_CLUB.replace(':clubId', club.id)}
            className="btn btn-primary btn-block"
          >
            Manage
          </Link>
        )}
        {isPending ? (
          <Button className="btn-block" disabled>
            Application Pending
          </Button>
        ) : (
          !hasMembership && (
            <Button className="btn-block" onClick={() => onApply?.(club.id)}>
              Apply to Join
            </Button>
          )
        )}
      </div>
    </article>
  );
}
