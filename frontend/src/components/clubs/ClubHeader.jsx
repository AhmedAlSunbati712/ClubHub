import { Link } from 'react-router-dom';
import { Users, Settings } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import { useCreateMembership } from '../../api/membership.ts';
import { ROUTES } from '../../constants/routes.js';

// gradient hero banner on club detail (Dartmouth green).
export default function ClubHeader({ club }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const { mutate: applyToClub, isPending: isApplying } = useCreateMembership();
  if (!club) return null;
  const canManage = club.viewerRole === 'Officer' || club.viewerRole === 'President';
  const isActiveMember = Boolean(club.viewerRole) && club.viewerStatus === 'Active';
  const isPendingApplication = club.viewerStatus === 'Pending';

  const handleLeave = async () => {
    const ok = await confirm({
      title: 'Leave club?',
      message: `You'll lose access to ${club.name}'s member events and updates.`,
      confirmLabel: 'Leave',
    });
    if (ok) toast(`You left ${club.name}`, { variant: 'info' });
  };
  const handleApply = () => {
    applyToClub(club.id, {
      onSuccess: () => toast(`Application submitted to ${club.name}`),
      onError: (error) =>
        toast(error?.response?.data?.Error || 'Failed to apply to join club', { variant: 'error' }),
    });
  };

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
            {isActiveMember && <span className="pill">{club.viewerRole}</span>}
            {isPendingApplication && <span className="pill">Pending</span>}
          </div>
        </div>
      </div>

      <p className="club-hero__desc">{club.description}</p>

      <div className="club-hero__meta">
        <Users />
        {club.memberCount} members
      </div>

      <div className="club-hero__actions">
        {isActiveMember ? (
          <button type="button" className="btn btn-on-dark" onClick={handleLeave}>
            Leave Club
          </button>
        ) : isPendingApplication ? (
          <button type="button" className="btn btn-on-light" disabled>
            Application Pending
          </button>
        ) : (
          <button type="button" className="btn btn-on-light" onClick={handleApply} disabled={isApplying}>
            {isApplying ? 'Applying…' : 'Apply to Join'}
          </button>
        )}
        {canManage && (
          <Link to={ROUTES.MANAGE_CLUB.replace(':clubId', club.id)} className="btn btn-on-light">
            <Settings size={16} />
            Manage Club
          </Link>
        )}
      </div>
    </header>
  );
}
