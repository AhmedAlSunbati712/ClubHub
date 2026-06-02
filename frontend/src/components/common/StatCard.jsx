// Quick-stat tile: tonal icon chip + label + value (Profile "Quick Stats").
export default function StatCard({ label, value, icon: Icon, tone = 'green' }) {
  return (
    <div className="quick-stat">
      <span className={`quick-stat__icon tone-${tone}`}>
        {Icon && <Icon />}
      </span>
      <span className="quick-stat__body">
        <span className="quick-stat__label">{label}</span>
        <span className="quick-stat__value tnum">{value}</span>
      </span>
    </div>
  );
}
