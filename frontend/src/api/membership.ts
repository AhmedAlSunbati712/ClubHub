import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './axios';

export const CLUB_MEMBERSHIPS_KEY = 'club-memberships';
export const USER_MEMBERSHIPS_KEY = 'user-memberships';

export interface Membership {
  userId: number;
  clubId: number;
  role: string;
  status: string;
  joinDate: string | null;
}

export interface UpdateMembershipPayload {
  role?: string;
  status?: string;
}

interface BackendMembership {
  UserID?: number;
  ClubID?: number;
  Role?: string;
  Status?: string;
  JoinDate?: string | null;
}

const normalizeMembership = (membership: BackendMembership): Membership => ({
  userId: membership.UserID ?? 0,
  clubId: membership.ClubID ?? 0,
  role: membership.Role ?? '',
  status: membership.Status ?? '',
  joinDate: membership.JoinDate ?? null,
});

export function useClubMemberships(clubId: number | string | undefined) {
  return useQuery({
    queryKey: [CLUB_MEMBERSHIPS_KEY, clubId],
    queryFn: async () => {
      const response = await api.get(`/api/clubs/${clubId}/memberships`);
      return (response.data as BackendMembership[]).map(normalizeMembership);
    },
    enabled: clubId !== undefined && clubId !== null && clubId !== '',
  });
}

export function useUserMemberships(userId: number | string | undefined) {
  return useQuery({
    queryKey: [USER_MEMBERSHIPS_KEY, userId],
    queryFn: async () => {
      const response = await api.get(`/api/users/${userId}/memberships`);
      return (response.data as BackendMembership[]).map(normalizeMembership);
    },
    enabled: userId !== undefined && userId !== null && userId !== '',
  });
}

export function useCreateMembership(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clubId: number | string) => {
      const response = await api.post(`/api/clubs/${clubId}/memberships`);
      return { data: response.data, clubId };
    },
    onSuccess: ({ clubId }) => {
      queryClient.invalidateQueries({ queryKey: [CLUB_MEMBERSHIPS_KEY, clubId] });
      queryClient.invalidateQueries({ queryKey: [USER_MEMBERSHIPS_KEY] });
      onSuccess?.();
    },
  });
}

export function useUpdateMembership(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clubId,
      userId,
      payload,
    }: {
      clubId: number | string;
      userId: number | string;
      payload: UpdateMembershipPayload;
    }) => {
      const response = await api.put(`/api/clubs/${clubId}/memberships/${userId}`, payload);
      return { data: response.data, clubId, userId };
    },
    onSuccess: ({ clubId, userId }) => {
      queryClient.invalidateQueries({ queryKey: [CLUB_MEMBERSHIPS_KEY, clubId] });
      queryClient.invalidateQueries({ queryKey: [USER_MEMBERSHIPS_KEY, userId] });
      onSuccess?.();
    },
  });
}

export function useDeleteMembership(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clubId,
      userId,
    }: {
      clubId: number | string;
      userId: number | string;
    }) => {
      const response = await api.delete(`/api/clubs/${clubId}/memberships/${userId}`);
      return { data: response.data, clubId, userId };
    },
    onSuccess: ({ clubId, userId }) => {
      queryClient.invalidateQueries({ queryKey: [CLUB_MEMBERSHIPS_KEY, clubId] });
      queryClient.invalidateQueries({ queryKey: [USER_MEMBERSHIPS_KEY, userId] });
      onSuccess?.();
    },
  });
}
