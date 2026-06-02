import { adminStats } from '../data/fixtures.js';

// dashboard totals + top clubs. TODO: wire to api/admin.js.
export function useAdminStats() {
  const stats = adminStats.totals;
  const topClubs = adminStats.topClubs;
  const upcomingEvents = adminStats.upcomingEvents;
  const loading = false;
  const error = null;

  return { stats, topClubs, upcomingEvents, loading, error };
}
