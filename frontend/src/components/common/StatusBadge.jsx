// Confirmed / Waitlisted / Event Full pills. status: 'confirmed' | 'waitlisted' | 'full'
const LABELS = {
  confirmed: 'Confirmed',
  waitlisted: 'Waitlisted',
  full: 'Event Full',
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <span className={`status-badge status-${status}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
