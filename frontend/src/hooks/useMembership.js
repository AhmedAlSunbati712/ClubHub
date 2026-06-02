import { clubMembers, clubPending } from '../data/fixtures.js';

// join, leave, approve/reject applications. TODO: wire to api/membership.js.
export function useMembership(clubId) {
  const members = clubMembers[clubId] ?? [];
  const pending = clubPending[clubId] ?? [];
  const loading = false;
  const error = null;

  const join = async () => {};
  const leave = async () => {};
  const approve = async (applicationId) => {};
  const reject = async (applicationId) => {};

  return { members, pending, loading, error, join, leave, approve, reject };
}
