// Member / Officer / President / Admin pills.
export default function RoleBadge({ role }) {
  if (!role) return null;
  return (
    <span className={`role-badge role-${String(role).toLowerCase()}`}>
      {role}
    </span>
  );
}
