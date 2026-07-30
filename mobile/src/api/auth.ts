import { apiClient } from "./client";
import { User } from "../types/models";

export interface AuthResponse {
  user: User;
  token: string;
}

export function login(email: string, password: string) {
  return apiClient.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data);
}

export function register(input: { fullName: string; companyName?: string; email: string; password: string }) {
  return apiClient.post<AuthResponse>("/auth/register", input).then((r) => r.data);
}

export function getMe() {
  return apiClient.get<User>("/auth/me").then((r) => r.data);
}

export function updateProfile(input: { fullName?: string; companyName?: string }) {
  return apiClient.patch<User>("/auth/me", input).then((r) => r.data);
}
