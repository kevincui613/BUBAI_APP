import dayjs from "dayjs";
import type { AuthResult, CalendarDaySummary, DailyTask, Goal, StatsOverview, User } from "@/types";
import type { CreateGoalPayload } from "@/api/goals";

interface MockUser extends User {
  password: string;
  createdAt: string;
}

interface MockGoal extends Goal {
  userId: string;
  createdAt: string;
}

interface MockTask extends DailyTask {
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface MockState {
  users: MockUser[];
  goals: MockGoal[];
  tasks: MockTask[];
}

const DB_KEY = "lp_v1_mock_db";
const DEMO_EMAIL = "demo@study.local";
const DEMO_PASSWORD = "123456";
const DEMO_NICKNAME = "演示用户";

export const useMockApi = (import.meta.env.VITE_USE_MOCK || "true") === "true";

export function resetMockData() {
  localStorage.removeItem(DB_KEY);
}

function toId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildToken(userId: string) {
  return `mock-token-${userId}`;
}

function parseToken(token: string | null) {
  if (!token?.startsWith("mock-token-")) return null;
  return token.replace("mock-token-", "");
}

function weekStartMonday(baseDate = dayjs()) {
  const weekday = (baseDate.day() + 6) % 7;
  return baseDate.subtract(weekday, "day").startOf("day");
}

function readState(): MockState {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const seeded = seedState();
    writeState(seeded);
    return seeded;
  }
  try {
    return JSON.parse(raw) as MockState;
  } catch {
    const seeded = seedState();
    writeState(seeded);
    return seeded;
  }
}

function writeState(state: MockState) {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
}

function ensureDemoGoalTasks(userId: string): { goals: MockGoal[]; tasks: MockTask[] } {
  const start = dayjs().startOf("month");
  const end = start.add(29, "day");
  const goal: MockGoal = {
    id: toId("goal"),
    userId,
    title: "Vue3 + TS 系统化学习",
    description: "每周完成学习章节与练习，形成输出",
    targetTotal: 30,
    unit: "hour",
    startDate: start.format("YYYY-MM-DD"),
    endDate: end.format("YYYY-MM-DD"),
    status: "active",
    createdAt: new Date().toISOString()
  };

  const tasks = generateTasksFromGoal(goal).map((task) => {
    const date = dayjs(task.taskDate);
    const today = dayjs().startOf("day");
    const shouldComplete = date.isBefore(today, "day") && date.day() !== 0;
    if (shouldComplete) {
      return {
        ...task,
        isCompleted: true,
        completedAmount: task.plannedAmount,
        updatedAt: new Date().toISOString()
      };
    }
    return task;
  });

  return { goals: [goal], tasks };
}

function seedState(): MockState {
  const demoUser: MockUser = {
    id: toId("user"),
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    nickname: DEMO_NICKNAME,
    createdAt: new Date().toISOString()
  };

  const seeded = ensureDemoGoalTasks(demoUser.id);

  return {
    users: [demoUser],
    goals: seeded.goals,
    tasks: seeded.tasks
  };
}

function getCurrentUserOrThrow(state: MockState): MockUser {
  const token = localStorage.getItem("accessToken");
  const userId = parseToken(token);
  if (!userId) {
    throw new Error("未登录");
  }
  const user = state.users.find((item) => item.id === userId);
  if (!user) {
    throw new Error("用户不存在");
  }
  return user;
}

function generateTasksFromGoal(goal: MockGoal): MockTask[] {
  const start = dayjs(goal.startDate);
  const end = dayjs(goal.endDate);
  const days = Math.max(1, end.diff(start, "day") + 1);
  const base = Math.floor(goal.targetTotal / days);
  const remainder = goal.targetTotal % days;

  return Array.from({ length: days }).map((_, index) => {
    const planned = base + (index < remainder ? 1 : 0);
    const date = start.add(index, "day").format("YYYY-MM-DD");
    return {
      id: toId("task"),
      userId: goal.userId,
      goalId: goal.id,
      taskDate: date,
      title: `${goal.title} · 第${index + 1}天`,
      plannedAmount: planned,
      completedAmount: 0,
      isCompleted: false,
      note: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
}

function asGoal(goal: MockGoal): Goal {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    targetTotal: goal.targetTotal,
    unit: goal.unit,
    startDate: goal.startDate,
    endDate: goal.endDate,
    status: goal.status
  };
}

function asTask(task: MockTask): DailyTask {
  return {
    id: task.id,
    goalId: task.goalId,
    taskDate: task.taskDate,
    title: task.title,
    plannedAmount: task.plannedAmount,
    completedAmount: task.completedAmount,
    isCompleted: task.isCompleted,
    note: task.note
  };
}

function calcOverview(tasks: MockTask[], today = dayjs()): StatsOverview {
  const todayStr = today.format("YYYY-MM-DD");
  const todayTasks = tasks.filter((item) => item.taskDate === todayStr);
  const todayTotalTasks = todayTasks.length;
  const todayCompletedTasks = todayTasks.filter((item) => item.isCompleted).length;

  const weekStart = weekStartMonday(today);
  const weekEnd = weekStart.add(6, "day");
  const weekTasks = tasks.filter((item) => {
    const taskDate = dayjs(item.taskDate);
    return (
      (taskDate.isAfter(weekStart, "day") || taskDate.isSame(weekStart, "day")) &&
      (taskDate.isBefore(weekEnd, "day") || taskDate.isSame(weekEnd, "day"))
    );
  });
  const weeklyCompletionRate = weekTasks.length
    ? Math.round((weekTasks.filter((item) => item.isCompleted).length / weekTasks.length) * 100)
    : 0;

  const tasksByDate = new Map<string, MockTask[]>();
  tasks.forEach((item) => {
    const list = tasksByDate.get(item.taskDate) || [];
    list.push(item);
    tasksByDate.set(item.taskDate, list);
  });

  let currentStreakDays = 0;
  let cursor = today.startOf("day");

  while (true) {
    const date = cursor.format("YYYY-MM-DD");
    const list = tasksByDate.get(date) || [];
    if (list.length === 0) break;
    const allDone = list.every((item) => item.isCompleted);
    if (!allDone) break;
    currentStreakDays += 1;
    cursor = cursor.subtract(1, "day");
  }

  return {
    currentStreakDays,
    weeklyCompletionRate,
    todayCompletedTasks,
    todayTotalTasks
  };
}

function delay(ms = 180) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const mockApi = {
  async register(payload: { email: string; password: string; nickname: string }): Promise<AuthResult> {
    await delay();
    const state = readState();
    const exists = state.users.some((item) => item.email === payload.email);
    if (exists) {
      throw new Error("邮箱已注册");
    }

    const user: MockUser = {
      id: toId("user"),
      email: payload.email,
      password: payload.password,
      nickname: payload.nickname,
      createdAt: new Date().toISOString()
    };

    state.users.push(user);
    writeState(state);

    return {
      user: { id: user.id, email: user.email, nickname: user.nickname },
      accessToken: buildToken(user.id)
    };
  },

  async login(payload: { email: string; password: string }): Promise<AuthResult> {
    await delay();
    const state = readState();
    const user = state.users.find((item) => item.email === payload.email && item.password === payload.password);
    if (!user) {
      throw new Error("账号或密码错误");
    }

    return {
      user: { id: user.id, email: user.email, nickname: user.nickname },
      accessToken: buildToken(user.id)
    };
  },

  async getMe(): Promise<User> {
    await delay(80);
    const state = readState();
    const user = getCurrentUserOrThrow(state);
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname
    };
  },

  async createGoal(payload: CreateGoalPayload): Promise<Goal> {
    await delay();
    const state = readState();
    const user = getCurrentUserOrThrow(state);

    const goal: MockGoal = {
      id: toId("goal"),
      userId: user.id,
      title: payload.title,
      description: payload.description || "",
      targetTotal: payload.targetTotal,
      unit: payload.unit,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: "active",
      createdAt: new Date().toISOString()
    };

    const tasks = generateTasksFromGoal(goal);
    state.goals.unshift(goal);
    state.tasks.push(...tasks);
    writeState(state);

    return asGoal(goal);
  },

  async fetchGoals(status?: string): Promise<Goal[]> {
    await delay(120);
    const state = readState();
    const user = getCurrentUserOrThrow(state);
    return state.goals
      .filter((item) => item.userId === user.id)
      .filter((item) => (status ? item.status === status : true))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .map(asGoal);
  },

  async fetchMonthCalendar(year: number, month: number): Promise<CalendarDaySummary[]> {
    await delay(120);
    const state = readState();
    const user = getCurrentUserOrThrow(state);
    const monthString = `${year}-${String(month).padStart(2, "0")}`;

    const tasks = state.tasks.filter((item) => item.userId === user.id && item.taskDate.startsWith(monthString));
    const map = new Map<string, MockTask[]>();
    tasks.forEach((item) => {
      const list = map.get(item.taskDate) || [];
      list.push(item);
      map.set(item.taskDate, list);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, list]) => {
        const totalTasks = list.length;
        const completedTasks = list.filter((item) => item.isCompleted).length;
        const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return { date, totalTasks, completedTasks, completionRate };
      });
  },

  async fetchDayTasks(date: string): Promise<DailyTask[]> {
    await delay(120);
    const state = readState();
    const user = getCurrentUserOrThrow(state);

    return state.tasks
      .filter((item) => item.userId === user.id && item.taskDate === date)
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(asTask);
  },

  async checkinTask(
    taskId: string,
    payload: { isCompleted: boolean; completedAmount?: number; note?: string }
  ): Promise<DailyTask> {
    await delay(80);
    const state = readState();
    const user = getCurrentUserOrThrow(state);

    const task = state.tasks.find((item) => item.id === taskId && item.userId === user.id);
    if (!task) {
      throw new Error("任务不存在");
    }

    task.isCompleted = payload.isCompleted;
    task.completedAmount = payload.isCompleted ? payload.completedAmount ?? task.plannedAmount : 0;
    task.note = payload.note || "";
    task.updatedAt = new Date().toISOString();

    writeState(state);
    return asTask(task);
  },

  async fetchOverview(): Promise<StatsOverview> {
    await delay(80);
    const state = readState();
    const user = getCurrentUserOrThrow(state);
    const userTasks = state.tasks.filter((item) => item.userId === user.id);
    return calcOverview(userTasks);
  }
};
