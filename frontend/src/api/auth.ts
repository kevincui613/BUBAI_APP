import { http } from "./http";
import type { ApiResponse, AuthResult, User } from "@/types";
import { mockApi, useMockApi } from "@/mock/mock-api";

export async function register(payload: { email: string; password: string; nickname: string }) {
  if (useMockApi) {
    return mockApi.register(payload);
  }
  const { data } = await http.post<ApiResponse<AuthResult>>("/auth/register", payload);
  return data.data;
}

export async function login(payload: { email: string; password: string }) {
  if (useMockApi) {
    return mockApi.login(payload);
  }
  const { data } = await http.post<ApiResponse<AuthResult>>("/auth/login", payload);
  return data.data;
}

export async function getMe() {
  if (useMockApi) {
    return mockApi.getMe();
  }
  const { data } = await http.get<ApiResponse<User>>("/auth/me");
  return data.data;
}
