import { http } from "./http";
import type { ApiResponse, CalendarDaySummary, DailyTask, StatsOverview } from "@/types";
import { mockApi, useMockApi } from "@/mock/mock-api";

export async function fetchMonthCalendar(year: number, month: number) {
  if (useMockApi) {
    return mockApi.fetchMonthCalendar(year, month);
  }
  // 修正路径：/calendar/month → /tasks/calendar
  const { data } = await http.get<ApiResponse<any[]>>("/tasks/calendar", {
    params: { year, month }
  });
  // 转换后端数据格式
  const calendarData = (data.data || []).map(item => ({
    date: item.date,
    totalTasks: item.totalCount || item.tasks?.length || 0,
    completedTasks: item.completedCount || 0,
    completionRate: item.totalCount > 0 ? (item.completedCount / item.totalCount) * 100 : 0
  }));
  return calendarData;
}

export async function fetchDayTasks(date: string) {
  if (useMockApi) {
    return mockApi.fetchDayTasks(date);
  }
  // 后端没有单独的 day 接口，使用日历接口获取
  const [year, month] = date.split('-');
  const { data } = await http.get<ApiResponse<any[]>>("/tasks/calendar", {
    params: { year: parseInt(year), month: parseInt(month) }
  });
  const dayData = (data.data || []).find(item => item.date === date);
  const tasks = dayData?.tasks || [];
  // 转换为前端期望的格式
  return tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    plannedAmount: task.plannedAmount,
    completedAmount: task.completedAmount,
    isCompleted: task.isCompleted,
    note: task.note,
    goalId: task.goalId,
    taskDate: task.taskDate
  }));
}

export async function checkinTask(
  taskId: string,
  payload: { isCompleted: boolean; completedAmount?: number; note?: string }
) {
  if (useMockApi) {
    return mockApi.checkinTask(taskId, payload);
  }
  // 修正路径：/tasks/${taskId}/checkin → /tasks/${taskId}/complete
  const { data } = await http.post<ApiResponse<DailyTask>>(`/tasks/${taskId}/complete`, {
    completedAmount: payload.completedAmount
  });
  return data.data;
}

export async function fetchOverview(weekStart?: string) {
  if (useMockApi) {
    return mockApi.fetchOverview();
  }
  // 修正路径：/stats/overview → /tasks/stats
  const { data } = await http.get<ApiResponse<StatsOverview>>("/tasks/stats");
  return data.data;
}