import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// ranked list on dashboard.
export default function TopClubsList({ clubs = [] }) {
  return (
    <ol className="top-clubs">
      {clubs.map((club, i) => (
        <li key={club.id} className="top-club">
          <span className="top-club__rank">{i + 1}</span>
          <span className="top-club__body">
            <span className="top-club__name">
              <Link to={`/clubs/${club.id}`}>{club.name}</Link>
            </span>
            <span className="top-club__count tnum">{club.memberCount} members</span>
          </span>
          <ChevronRight />
        </li>
      ))}
    </ol>
  );
}
