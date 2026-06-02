import { clubs as fixtureClubs, getClub } from '../data/fixtures.js';

// list, detail, create, update, deactivate. TODO: wire to api/clubs.js.
export function useClubs() {
  const clubs = fixtureClubs;
  const loading = false;
  const error = null;

  const create = async (payload) => {};
  const update = async (clubId, payload) => {};
  const deactivate = async (clubId) => {};

  return { clubs, loading, error, create, update, deactivate };
}

export function useClub(clubId) {
  const club = getClub(clubId);
  const loading = false;
  const error = null;

  return { club, loading, error };
}
