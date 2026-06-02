import { CalendarDays, CheckCircle2, Clock, Users } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatEventDate } from '../../utils/format.js';

// compact row (profile/dashboard "Upcoming Events").
export default function EventListItem({ event }) {
  if (!event) return null;
  const waitlisted = event.status === 'waitlisted';
  const Icon = waitlisted ? Clock : CheckCircle2;

  return (
    <li className="event-li">
      <span className={`event-li__icon event-li__icon--${event.status ?? 'confirmed'}`}>
        <Icon />
      </span>
      <div className="event-li__body">
        <span className="event-li__title">
          {event.title}
          <StatusBadge status={event.status} />
        </span>
        {event.club && (
          <span className="event-li__meta">
            <Users size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
            {event.club}
          </span>
        )}
        <span className="event-li__meta">
          <CalendarDays size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
          {formatEventDate(event.date)}
        </span>
        {event.location && <span className="event-li__loc">{event.location}</span>}
      </div>
    </li>
  );
}
