import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './axios';

export const EVENTS_KEY = 'events';
export const CLUB_EVENTS_KEY = 'club-events';
export const EVENT_RSVPS_KEY = 'event-rsvps';

export interface Rsvp {
  userId: number;
  status: string;
  requestedAt: string | null;
  checkedIn: boolean;
  checkInTime: string | null;
  name: string;
  email: string;
}

export interface UpdateRsvpPayload {
  status: string;
}

interface BackendRsvp {
  UserID?: number;
  RSVPStatus?: string;
  RequestedAt?: string | null;
  CheckedIn?: number | boolean;
  CheckInTime?: string | null;
  Name?: string;
  Email?: string;
}

const normalizeRsvp = (rsvp: BackendRsvp): Rsvp => ({
  userId: rsvp.UserID ?? 0,
  status: rsvp.RSVPStatus ?? '',
  requestedAt: rsvp.RequestedAt ?? null,
  checkedIn: Boolean(rsvp.CheckedIn),
  checkInTime: rsvp.CheckInTime ?? null,
  name: rsvp.Name ?? '',
  email: rsvp.Email ?? '',
});

const invalidateRsvpQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: number | string,
  clubId?: number | string | null,
) => {
  queryClient.invalidateQueries({ queryKey: [EVENT_RSVPS_KEY, eventId] });
  queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
  queryClient.invalidateQueries({ queryKey: [EVENTS_KEY, eventId] });

  if (clubId !== undefined && clubId !== null && clubId !== '') {
    queryClient.invalidateQueries({ queryKey: [CLUB_EVENTS_KEY, clubId] });
  }

  queryClient.invalidateQueries({
    predicate: (query) =>
      Array.isArray(query.queryKey) && query.queryKey.includes(EVENT_RSVPS_KEY),
  });
};

export function useEventRsvps(eventId: number | string | undefined) {
  return useQuery({
    queryKey: [EVENT_RSVPS_KEY, eventId],
    queryFn: async () => {
      const response = await api.get(`/api/events/${eventId}/rsvps`);
      return (response.data as BackendRsvp[]).map(normalizeRsvp);
    },
    enabled: eventId !== undefined && eventId !== null && eventId !== '',
  });
}

export function useCreateRsvp(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, clubId }: { eventId: number | string; clubId?: number | string | null }) => {
      const response = await api.post(`/api/events/${eventId}/rsvps`);
      return { data: response.data as { status: string }, eventId, clubId };
    },
    onSuccess: ({ eventId, clubId }) => {
      invalidateRsvpQueries(queryClient, eventId, clubId);
      onSuccess?.();
    },
  });
}

export function useUpdateRsvp(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      userId,
      clubId,
      payload,
    }: {
      eventId: number | string;
      userId: number | string;
      clubId?: number | string | null;
      payload: UpdateRsvpPayload;
    }) => {
      const response = await api.put(`/api/events/${eventId}/rsvps/${userId}`, payload);
      return { data: response.data, eventId, clubId };
    },
    onSuccess: ({ eventId, clubId }) => {
      invalidateRsvpQueries(queryClient, eventId, clubId);
      onSuccess?.();
    },
  });
}

export function useDeleteRsvp(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      userId,
      clubId,
    }: {
      eventId: number | string;
      userId: number | string;
      clubId?: number | string | null;
    }) => {
      const response = await api.delete(`/api/events/${eventId}/rsvps/${userId}`);
      return { data: response.data, eventId, clubId };
    },
    onSuccess: ({ eventId, clubId }) => {
      invalidateRsvpQueries(queryClient, eventId, clubId);
      onSuccess?.();
    },
  });
}
