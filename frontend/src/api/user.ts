import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from './axios';
import { UserRole } from '../types/user';

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

// the backend return UserID, frontend expects userId. annoying mismatches so im just gonna handle it with this
const normalizeUser = (user: BackendUser) => ({
  id: user.UserID ?? user.userId ?? 0,
  name: user.Name ?? user.name ?? '',
  email: user.Email ?? user.email ?? '',
  role: user.Role ?? user.role ?? UserRole.STUDENT,
});

export const createUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: CreateUserDTO) => {
      const response = await axios.post('/api/users/', userData);
      return normalizeUser(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
      onSuccess?.();
    }
  });
};

export const getUserById = (userId: string) => {
  return useQuery({
    queryKey: [USERS_KEY, userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}`);
      return normalizeUser(response.data);
    }
  });
};

export const getUsers = (query?: GetUsersDTO) => {
  return useQuery({
    queryKey: [USERS_KEY, query],
    queryFn: async () => {
      const response = await axios.get('/api/users/', {
        params: query
      });
      return response.data.map(normalizeUser);
    }
  });
};

export const updateUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, updatePayload }: { userId: string, updatePayload: UpdateUserDTO }) => {
      const response = await axios.put(`/api/users/${userId}`, updatePayload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY]});
      onSuccess?.();
    }
  });
};

export const deleteUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await axios.delete(`/api/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY]});
      onSuccess?.();
    }
  });
};
