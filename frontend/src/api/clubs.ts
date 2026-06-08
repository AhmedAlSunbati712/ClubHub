/**
 * clubs.ts   Ahmed Al Sunbati
 * CS61     Spring 26
 * 
 * Description: Defines typed TanStack Query hooks for club browsing, club detail lookups,
 *              officer lists and club create/update/delete mutations.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './axios';

export const CLUBS_KEY = 'clubs';
export const CLUB_OFFICERS_KEY = 'club-officers';

export interface Club {
  id: number;
  name: string;
  category: string;
  description: string;
  status: string;
}

export interface ClubOfficer {
  id: number;
  name: string;
  role: string;
}

export interface ClubListQuery {
  name?: string;
  category?: string;
}

export interface CreateClubPayload {
  name: string;
  description: string;
  category: string;
  status: string;
}

export interface UpdateClubPayload {
  name?: string;
  description?: string;
  category?: string;
  status?: string;
}

interface BackendClub {
  ClubID?: number;
  ClubName?: string;
  Category?: string;
  Description?: string;
  Status?: string;
}

interface BackendClubOfficer {
  UserID?: number;
  Name?: string;
  Role?: string;
}

const normalizeClub = (club: BackendClub): Club => ({
  id: club.ClubID ?? 0,
  name: club.ClubName ?? '',
  category: club.Category ?? '',
  description: club.Description ?? '',
  status: club.Status ?? '',
});

const normalizeClubOfficer = (officer: BackendClubOfficer): ClubOfficer => ({
  id: officer.UserID ?? 0,
  name: officer.Name ?? '',
  role: officer.Role ?? '',
});

export function useClubs(query?: ClubListQuery) {
  return useQuery({
    queryKey: [CLUBS_KEY, query],
    queryFn: async () => {
      const response = await api.get('/api/clubs/', { params: query });
      return (response.data as BackendClub[]).map(normalizeClub);
    },
  });
}

export function useClub(clubId: number | string | undefined) {
  return useQuery({
    queryKey: [CLUBS_KEY, clubId],
    queryFn: async () => {
      const response = await api.get(`/api/clubs/${clubId}`);
      return normalizeClub(response.data as BackendClub);
    },
    enabled: clubId !== undefined && clubId !== null && clubId !== '',
  });
}

export function useClubOfficers(clubId: number | string | undefined) {
  return useQuery({
    queryKey: [CLUB_OFFICERS_KEY, clubId],
    queryFn: async () => {
      const response = await api.get(`/api/clubs/${clubId}/officers`);
      return (response.data as BackendClubOfficer[]).map(normalizeClubOfficer);
    },
    enabled: clubId !== undefined && clubId !== null && clubId !== '',
  });
}

export function useCreateClub(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateClubPayload) => {
      const response = await api.post('/api/clubs/', payload);
      return response.data as { clubId: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLUBS_KEY] });
      onSuccess?.();
    },
  });
}

export function useUpdateClub(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clubId, payload }: { clubId: number | string; payload: UpdateClubPayload }) => {
      const response = await api.put(`/api/clubs/${clubId}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CLUBS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLUBS_KEY, variables.clubId] });
      onSuccess?.();
    },
  });
}

export function useDeleteClub(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clubId: number | string) => {
      const response = await api.delete(`/api/clubs/${clubId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLUBS_KEY] });
      onSuccess?.();
    },
  });
}
