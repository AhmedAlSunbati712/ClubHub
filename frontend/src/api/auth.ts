/**
 * auth.ts   Ahmed Al Sunbati
 * CS61     Spring 26
 * 
 * Description: Defines api methods to facilitate user log in and getting information about current signed in-user
 */
import axios from "./axios";
import { UserRole } from "../types/user";


type LoginDTO = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
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
const normalizeUser = (user: BackendUser): AuthUser => ({
  id: user.UserID ?? user.userId ?? 0,
  name: user.Name ?? user.name ?? "",
  email: user.Email ?? user.email ?? "",
  role: user.Role ?? user.role ?? UserRole.STUDENT,
});

export async function login(payload: LoginDTO): Promise<LoginResponse> {
  const response = await axios.post("/api/auth/login", payload);
  return response.data;
}

export async function getMe(): Promise<AuthUser> {
  const response = await axios.get("/api/auth/me");
  return normalizeUser(response.data);
}
