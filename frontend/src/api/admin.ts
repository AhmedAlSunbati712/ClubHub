import { useQuery } from '@tanstack/react-query';
import api from './axios';

export const ADMIN_STATS_KEY = 'admin-stats';

export interface AdminTotals {
  clubs: number;
  events: number;
  students: number;
  memberships: number;
}

export interface TopClub {
  id: number;
  name: string;
  memberCount: number;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  club: string;
  date: string;
  filled: number;
  capacity: number;
}

export interface AdminStats {
  totals: AdminTotals;
  topClubs: TopClub[];
  upcomingEvents: UpcomingEvent[];
}

interface BackendTotals {
  clubs?: number;
  events?: number;
  students?: number;
  memberships?: number;
}

interface BackendTopClub {
  id?: number;
  name?: string;
  memberCount?: number;
}

interface BackendUpcomingEvent {
  id?: number;
  title?: string;
  club?: string;
  date?: string;
  filled?: number;
  capacity?: number;
}

interface BackendAdminStats {
  totals?: BackendTotals;
  topClubs?: BackendTopClub[];
  upcomingEvents?: BackendUpcomingEvent[];
}

const normalizeTotals = (totals: BackendTotals = {}): AdminTotals => ({
  clubs: totals.clubs ?? 0,
  events: totals.events ?? 0,
  students: totals.students ?? 0,
  memberships: totals.memberships ?? 0,
});

const normalizeTopClub = (club: BackendTopClub): TopClub => ({
  id: club.id ?? 0,
  name: club.name ?? '',
  memberCount: club.memberCount ?? 0,
});

const normalizeUpcomingEvent = (event: BackendUpcomingEvent): UpcomingEvent => ({
  id: event.id ?? 0,
  title: event.title ?? '',
  club: event.club ?? '',
  date: event.date ?? '',
  filled: event.filled ?? 0,
  capacity: event.capacity ?? 0,
});

const normalizeStats = (stats: BackendAdminStats): AdminStats => ({
  totals: normalizeTotals(stats.totals),
  topClubs: (stats.topClubs ?? []).map(normalizeTopClub),
  upcomingEvents: (stats.upcomingEvents ?? []).map(normalizeUpcomingEvent),
});

export function useAdminStats() {
  return useQuery({
    queryKey: [ADMIN_STATS_KEY],
    queryFn: async () => {
      const response = await api.get('/api/admin/stats');
      return normalizeStats(response.data as BackendAdminStats);
    },
  });
}
