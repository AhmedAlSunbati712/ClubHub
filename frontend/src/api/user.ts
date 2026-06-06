import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './axios';
import { UserRole } from '../types/user';
import { EVENT_RSVPS_KEY } from './rsvp';

const USERS_KEY = 'users';

type CreateUserDTO = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

type GetUsersDTO = {
  name?: string;
  role?: UserRole;
  email?: string;
  id?: number;
};

type UpdateUserDTO = {
  name?: string;
  role?: UserRole;
  email?: string;
  password?: string;
};

type BackendUser = {
  UserID?: number;
  userId?: number;
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  Role?: UserRole;
  role?: UserRole;
};

type BackendUserRsvp = {
  EventID?: number;
  RSVPStatus?: string;
  CheckedIn?: number | boolean;
  CheckInTime?: string | null;
  Title?: string;
  EventDateTime?: string | null;
  Status?: string;
  ClubName?: string;
  Building?: string;
  Room?: string;
};

type UserRsvp = {
  eventId: number;
  rsvpStatus: string;
  checkedIn: boolean;
  checkInTime: string | null;
  title: string;
  eventDateTime: string | null;
  status: string;
  clubName: string;
  building: string;
  room: string;
};

// the backend return UserID, frontend expects userId. annoying mismatches so im just gonna handle it with this
const normalizeUser = (user: BackendUser) => ({
  id: user.UserID ?? user.userId ?? 0,
  name: user.Name ?? user.name ?? '',
  email: user.Email ?? user.email ?? '',
  role: user.Role ?? user.role ?? UserRole.STUDENT,
});

const normalizeUserRsvp = (rsvp: BackendUserRsvp): UserRsvp => ({
  eventId: rsvp.EventID ?? 0,
  rsvpStatus: rsvp.RSVPStatus ?? '',
  checkedIn: Boolean(rsvp.CheckedIn),
  checkInTime: rsvp.CheckInTime ?? null,
  title: rsvp.Title ?? '',
  eventDateTime: rsvp.EventDateTime ?? null,
  status: rsvp.Status ?? '',
  clubName: rsvp.ClubName ?? '',
  building: rsvp.Building ?? '',
  room: rsvp.Room ?? '',
});

export const useUserRsvps = (userId: number | string | undefined) => {
  return useQuery({
    queryKey: [USERS_KEY, EVENT_RSVPS_KEY, userId],
    queryFn: async () => {
      const response = await api.get(`/api/users/${userId}/rsvps`);
      return response.data.map(normalizeUserRsvp);
    },
    enabled: userId !== undefined && userId !== null && userId !== '',
  });
};

export const useCreateUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: CreateUserDTO) => {
      const response = await api.post('/api/users/', userData);
      return normalizeUser(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
      onSuccess?.();
    }
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: [USERS_KEY, userId],
    queryFn: async () => {
      const response = await api.get(`/api/users/${userId}`);
      return normalizeUser(response.data);
    }
  });
};

export const useUsers = (query?: GetUsersDTO) => {
  return useQuery({
    queryKey: [USERS_KEY, query],
    queryFn: async () => {
      const response = await api.get('/api/users/', {
        params: query
      });
      return response.data.map(normalizeUser);
    }
  });
};

export const useUpdateUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, updatePayload }: { userId: string, updatePayload: UpdateUserDTO }) => {
      const response = await api.put(`/api/users/${userId}`, updatePayload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY]});
      onSuccess?.();
    }
  });
};

export const useDeleteUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/api/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY]});
      onSuccess?.();
    }
  });
};
