import Avatar from '../common/Avatar.jsx';
import RoleBadge from '../common/RoleBadge.jsx';

// Club Officers panel.
export default function OfficerList({ officers = [] }) {
  return (
    <div className="card card-pad officer-list">
      <h3 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
        Club Officers
      </h3>
      {officers.length === 0 ? (
        <p className="empty-state">No officers assigned</p>
      ) : (
        <ul>
          {officers.map((o) => (
            <li key={o.id} className="officer-item">
              <Avatar name={o.name} muted />
              <span className="officer-item__name">{o.name}</span>
              <span style={{ marginLeft: 'auto' }}>
                <RoleBadge role={o.role} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
