/**
 * locations.ts   Ahmed Al Sunbati
 * CS61     Spring 26
 * 
 * Description: Defines typed TanStack Query hooks for location browsing, single-location
 *              lookups and create/update/delete mutations for admin location management.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './axios';

const LOCATIONS_KEY = 'locations';

export interface Location {
  id: number;
  building: string;
  room: string;
  capacity: number;
}

export interface LocationListQuery {
  building?: string;
  room?: string;
}

export interface CreateLocationPayload {
  building: string;
  room: string;
  capacity: number;
}

export interface UpdateLocationPayload {
  building?: string;
  room?: string;
  capacity?: number;
}

interface BackendLocation {
  LocationID?: number;
  Building?: string;
  Room?: string;
  Capacity?: number;
}

const normalizeLocation = (location: BackendLocation): Location => ({
  id: location.LocationID ?? 0,
  building: location.Building ?? '',
  room: location.Room ?? '',
  capacity: location.Capacity ?? 0,
});

export function useLocations(query?: LocationListQuery) {
  return useQuery({
    queryKey: [LOCATIONS_KEY, query],
    queryFn: async () => {
      const response = await api.get('/api/locations/', { params: query });
      return (response.data as BackendLocation[]).map(normalizeLocation);
    },
  });
}

export function useLocation(locationId: number | string | undefined) {
  return useQuery({
    queryKey: [LOCATIONS_KEY, locationId],
    queryFn: async () => {
      const response = await api.get(`/api/locations/${locationId}`);
      return normalizeLocation(response.data as BackendLocation);
    },
    enabled: locationId !== undefined && locationId !== null && locationId !== '',
  });
}

export function useCreateLocation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLocationPayload) => {
      const response = await api.post('/api/locations/', payload);
      return response.data as { locationId: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOCATIONS_KEY] });
      onSuccess?.();
    },
  });
}

export function useUpdateLocation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      locationId,
      payload,
    }: {
      locationId: number | string;
      payload: UpdateLocationPayload;
    }) => {
      const response = await api.put(`/api/locations/${locationId}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LOCATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [LOCATIONS_KEY, variables.locationId] });
      onSuccess?.();
    },
  });
}

export function useDeleteLocation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locationId: number | string) => {
      const response = await api.delete(`/api/locations/${locationId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOCATIONS_KEY] });
      onSuccess?.();
    },
  });
}
