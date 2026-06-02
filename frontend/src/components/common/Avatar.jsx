// initials circle (AT, SC, MJ).
function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

export default function Avatar({ name, size = 'md', muted = false }) {
  return (
    <span
      className={`avatar avatar-${size}${muted ? ' avatar-muted' : ''}`}
      title={name}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
