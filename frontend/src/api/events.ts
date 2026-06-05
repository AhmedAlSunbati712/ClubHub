import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './axios';

const EVENTS_KEY = 'events';
const EVENT_RSVPS_KEY = 'event-rsvps';
const EVENT_CHECKINS_KEY = 'event-checkins';
const CLUB_EVENTS_KEY = 'club-events';

export interface Event {
  id: number;
  clubId: number | null;
  locationId: number | null;
  title: string;
  date: string | null;
  capacity: number | null;
  confirmedCount: number;
  status: string;
}

export interface EventListQuery {
  clubId?: number;
  status?: string;
  title?: string;
}

export interface CreateEventPayload {
  clubId: number;
  locationId?: number | null;
  title: string;
  eventDateTime: string;
  eventCapacity?: number | null;
}

export interface UpdateEventPayload {
  locationId?: number | null;
  title?: string;
  eventDateTime?: string;
  eventCapacity?: number | null;
  status?: string;
}

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

export interface Checkin {
  userId: number;
  checkInTime: string | null;
  name: string;
  email: string;
}

interface BackendEvent {
  EventID?: number;
  ClubID?: number | null;
  LocationID?: number | null;
  Title?: string;
  EventDateTime?: string | null;
  EventCapacity?: number | null;
  ConfirmedCount?: number;
  Status?: string;
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

interface BackendCheckin {
  UserID?: number;
  CheckInTime?: string | null;
  Name?: string;
  Email?: string;
}

const normalizeEvent = (event: BackendEvent): Event => ({
  id: event.EventID ?? 0,
  clubId: event.ClubID ?? null,
  locationId: event.LocationID ?? null,
  title: event.Title ?? '',
  date: event.EventDateTime ?? null,
  capacity: event.EventCapacity ?? null,
  confirmedCount: event.ConfirmedCount ?? 0,
  status: event.Status ?? '',
});

const normalizeRsvp = (rsvp: BackendRsvp): Rsvp => ({
  userId: rsvp.UserID ?? 0,
  status: rsvp.RSVPStatus ?? '',
  requestedAt: rsvp.RequestedAt ?? null,
  checkedIn: Boolean(rsvp.CheckedIn),
  checkInTime: rsvp.CheckInTime ?? null,
  name: rsvp.Name ?? '',
  email: rsvp.Email ?? '',
});

const normalizeCheckin = (checkin: BackendCheckin): Checkin => ({
  userId: checkin.UserID ?? 0,
  checkInTime: checkin.CheckInTime ?? null,
  name: checkin.Name ?? '',
  email: checkin.Email ?? '',
});

const invalidateEventQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  eventId?: number | string | null,
  clubId?: number | string | null,
) => {
  queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });

  if (eventId !== undefined && eventId !== null && eventId !== '') {
    queryClient.invalidateQueries({ queryKey: [EVENTS_KEY, eventId] });
    queryClient.invalidateQueries({ queryKey: [EVENT_RSVPS_KEY, eventId] });
    queryClient.invalidateQueries({ queryKey: [EVENT_CHECKINS_KEY, eventId] });
  }

  if (clubId !== undefined && clubId !== null && clubId !== '') {
    queryClient.invalidateQueries({ queryKey: [CLUB_EVENTS_KEY, clubId] });
  }
};

export function useEvents(query?: EventListQuery) {
  return useQuery({
    queryKey: [EVENTS_KEY, query],
    queryFn: async () => {
      const response = await api.get('/api/events/', { params: query });
      return (response.data as BackendEvent[]).map(normalizeEvent);
    },
  });
}

export function useEvent(eventId: number | string | undefined) {
  return useQuery({
    queryKey: [EVENTS_KEY, eventId],
    queryFn: async () => {
      const response = await api.get(`/api/events/${eventId}`);
      return normalizeEvent(response.data as BackendEvent);
    },
    enabled: eventId !== undefined && eventId !== null && eventId !== '',
  });
}

export function useClubEvents(clubId: number | string | undefined) {
  return useQuery({
    queryKey: [CLUB_EVENTS_KEY, clubId],
    queryFn: async () => {
      const response = await api.get(`/api/clubs/${clubId}/events`);
      return (response.data as BackendEvent[]).map(normalizeEvent);
    },
    enabled: clubId !== undefined && clubId !== null && clubId !== '',
  });
}

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

export function useEventCheckins(eventId: number | string | undefined) {
  return useQuery({
    queryKey: [EVENT_CHECKINS_KEY, eventId],
    queryFn: async () => {
      const response = await api.get(`/api/events/${eventId}/checkins`);
      return (response.data as BackendCheckin[]).map(normalizeCheckin);
    },
    enabled: eventId !== undefined && eventId !== null && eventId !== '',
  });
}

export function useCreateEvent(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEventPayload) => {
      const response = await api.post('/api/events/', payload);
      return response.data as { eventId: number };
    },
    onSuccess: (_, variables) => {
      invalidateEventQueries(queryClient, null, variables.clubId);
      onSuccess?.();
    },
  });
}

export function useUpdateEvent(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, clubId, payload }: { eventId: number | string; clubId?: number | string | null; payload: UpdateEventPayload }) => {
      const response = await api.put(`/api/events/${eventId}`, payload);
      return { data: response.data, eventId, clubId };
    },
    onSuccess: ({ eventId, clubId }) => {
      invalidateEventQueries(queryClient, eventId, clubId);
      onSuccess?.();
    },
  });
}

export function useDeleteEvent(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, clubId }: { eventId: number | string; clubId?: number | string | null }) => {
      const response = await api.delete(`/api/events/${eventId}`);
      return { data: response.data, eventId, clubId };
    },
    onSuccess: ({ eventId, clubId }) => {
      invalidateEventQueries(queryClient, eventId, clubId);
      onSuccess?.();
    },
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
      invalidateEventQueries(queryClient, eventId, clubId);
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
      invalidateEventQueries(queryClient, eventId, clubId);
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
      invalidateEventQueries(queryClient, eventId, clubId);
      onSuccess?.();
    },
  });
}

export function useCheckIn(onSuccess?: () => void) {
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
      const response = await api.post(`/api/events/${eventId}/checkins/${userId}`);
      return { data: response.data, eventId, clubId };
    },
    onSuccess: ({ eventId, clubId }) => {
      invalidateEventQueries(queryClient, eventId, clubId);
      onSuccess?.();
    },
  });
}

export function useUndoCheckIn(onSuccess?: () => void) {
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
      const response = await api.delete(`/api/events/${eventId}/checkins/${userId}`);
      return { data: response.data, eventId, clubId };
    },
    onSuccess: ({ eventId, clubId }) => {
      invalidateEventQueries(queryClient, eventId, clubId);
      onSuccess?.();
    },
  });
}
