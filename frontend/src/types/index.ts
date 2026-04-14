export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetTotal: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "archived";
}

export interface DailyTask {
  id: string;
  goalId: string;
  taskDate: string;
  title: string;
  plannedAmount: number;
  completedAmount: number;
  isCompleted: boolean;
  note?: string;
}

export interface CalendarDaySummary {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface StatsOverview {
  currentStreakDays: number;
  weeklyCompletionRate: number;
  todayCompletedTasks: number;
  todayTotalTasks: number;
}

export type FriendVisibility = "public" | "friends" | "private";

export interface FriendUser {
  id: string;
  nickname: string;
  bio: string;
  goalTag: string;
  city: string;
  streakDays: number;
  compatibility: number;
}

export interface FriendCandidate extends FriendUser {
  isFriend: boolean;
  requestStatus: "none" | "pendingSent" | "pendingReceived";
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromNickname: string;
  fromGoalTag: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface BuddyRecommendation {
  id: string;
  nickname: string;
  reason: string;
  matchScore: number;
  goalTag: string;
  city: string;
}

export interface StudyCircle {
  id: string;
  name: string;
  category: string;
  intro: string;
  memberCount: number;
  isJoined: boolean;
}

export interface TeamPost {
  id: string;
  title: string;
  goal: string;
  headcount: number;
  currentCount: number;
  contact: string;
  createdBy: string;
  createdAt: string;
}

export interface TeamChallenge {
  id: string;
  title: string;
  target: string;
  progress: number;
  myRank: number;
  teamSize: number;
}

export interface AiPlanInput {
  goalTitle: string;
  periodDays: number;
  dailyMinutes: number;
  level: "beginner" | "intermediate" | "advanced";
}

export interface AiPlanTask {
  day: number;
  focus: string;
  minutes: number;
  deliverable: string;
}

export interface AiPlanResult {
  summary: string;
  tips: string[];
  tasks: AiPlanTask[];
}
