import { buildings, locationRows } from '../data/fixtures.js';

// list, create, update, delete. TODO: wire to api/locations.js.
export function useLocations() {
  const locations = locationRows;
  const loading = false;
  const error = null;

  const create = async (payload) => {};
  const update = async (locationId, payload) => {};
  const remove = async (locationId) => {};

  return { locations, buildings, loading, error, create, update, remove };
}
