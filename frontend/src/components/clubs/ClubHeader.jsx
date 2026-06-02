import { Link } from 'react-router-dom';
import { Users, Settings } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useConfirm } from '../../context/ConfirmContext.jsx';

// gradient hero banner on club detail (Dartmouth green).
export default function ClubHeader({ club }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  if (!club) return null;
  const canManage = club.viewerRole === 'Officer' || club.viewerRole === 'President';
  const isMember = Boolean(club.viewerRole);

  const handleLeave = async () => {
    const ok = await confirm({
      title: 'Leave club?',
      message: `You'll lose access to ${club.name}'s member events and updates.`,
      confirmLabel: 'Leave',
    });
    if (ok) toast(`You left ${club.name}`, { variant: 'info' });
  };
  const handleApply = () => toast(`Application submitted to ${club.name}`);

  return (
    <header className="club-hero">
      <div className="club-hero__top">
        <span className="club-hero__avatar">
          <Users />
        </span>
        <div>
          <h1 className="club-hero__name">{club.name}</h1>
          <div className="club-hero__badges">
            <span className="pill">{club.category}</span>
            {club.viewerRole && <span className="pill">{club.viewerRole}</span>}
          </div>
        </div>
      </div>

      <p className="club-hero__desc">{club.description}</p>

      <div className="club-hero__meta">
        <Users />
        {club.memberCount} members
      </div>

      <div className="club-hero__actions">
        {isMember ? (
          <button type="button" className="btn btn-on-dark" onClick={handleLeave}>
            Leave Club
          </button>
        ) : (
          <button type="button" className="btn btn-on-light" onClick={handleApply}>
            Apply to Join
          </button>
        )}
        {canManage && (
          <Link to={`/clubs/${club.id}/manage`} className="btn btn-on-light">
            <Settings size={16} />
            Manage Club
          </Link>
        )}
      </div>
    </header>
  );
}
