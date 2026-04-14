import { http } from "./http";
import type { ApiResponse, Goal } from "@/types";
import { mockApi, useMockApi } from "@/mock/mock-api";

export interface CreateGoalPayload {
  title: string;
  description?: string;
  targetTotal: number;
  unit: string;
  startDate: string;
  endDate: string;
}

export async function createGoal(payload: CreateGoalPayload) {
  if (useMockApi) {
    return mockApi.createGoal(payload);
  }
  const { data } = await http.post<ApiResponse<Goal>>("/goals", payload);
  console.log("创建目标响应:", data);
  return data.data;
}

export async function fetchGoals(status?: string) {
  if (useMockApi) {
    return mockApi.fetchGoals(status);
  }
  const { data } = await http.get<ApiResponse<Goal[]>>("/goals", {
    params: status ? { status } : undefined
  });
  console.log("获取目标列表响应:", data);
  return data.data || [];
}