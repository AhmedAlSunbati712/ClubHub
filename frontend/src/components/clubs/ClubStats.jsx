import CountUp from '../common/CountUp.jsx';

// Total Members / Officers / Upcoming Events.
export default function ClubStats({ stats }) {
  const { members = 0, officers = 0, upcomingEvents = 0 } = stats ?? {};
  const tiles = [
    { label: 'Total Members', value: members },
    { label: 'Officers', value: officers },
    { label: 'Upcoming Events', value: upcomingEvents },
  ];

  return (
    <div className="club-stats">
      {tiles.map((t) => (
        <div className="stat-tile" key={t.label}>
          <div className="stat-tile__label">{t.label}</div>
          <div className="stat-tile__value tnum">
            <CountUp value={t.value} />
          </div>
        </div>
      ))}
    </div>
  );
}
