// Role helpers. `user` shape: { role, clubRoles: { [clubId]: 'Officer' | 'President' } }

export const ROLES = {
  MEMBER: 'Member',
  OFFICER: 'Officer',
  PRESIDENT: 'President',
  ADMIN: 'Admin',
};

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

export function isOfficer(user, clubId) {
  if (clubId == null) return user?.role === ROLES.OFFICER;
  const clubRole = user?.clubRoles?.[clubId];
  return clubRole === ROLES.OFFICER || clubRole === ROLES.PRESIDENT;
}

export function isPresident(user, clubId) {
  if (clubId == null) return user?.role === ROLES.PRESIDENT;
  return user?.clubRoles?.[clubId] === ROLES.PRESIDENT;
}

export function canManageClub(user, clubId) {
  return isAdmin(user) || isPresident(user, clubId) || isOfficer(user, clubId);
}
