import { http } from "./http";
import { socialMockApi } from "@/mock/modules/social-mock";
import type {
  ApiResponse,
  BuddyRecommendation,
  FriendCandidate,
  FriendRequest,
  FriendUser,
  FriendVisibility,
  StudyCircle,
  TeamChallenge,
  TeamPost
} from "@/types";

const useSocialMockApi = (import.meta.env.VITE_USE_SOCIAL_MOCK || "false") === "true";

export async function searchUsers(keyword: string) {
  if (useSocialMockApi) {
    return socialMockApi.searchUsers(keyword);
  }
  const { data } = await http.get<ApiResponse<FriendCandidate[]>>("/social/users/search", { params: { keyword } });
  return data.data;
}

export async function sendFriendRequest(targetUserId: string) {
  if (useSocialMockApi) {
    return socialMockApi.sendFriendRequest(targetUserId);
  }
  await http.post<ApiResponse<null>>("/social/friend-requests/send", { friendId: targetUserId });
}

export async function fetchIncomingFriendRequests() {
  if (useSocialMockApi) {
    return socialMockApi.fetchIncomingRequests();
  }
  const { data } = await http.get<ApiResponse<any[]>>("/social/friend-requests/incoming");
  console.log("原始申请数据:", data.data);
  
  const requests = (data.data || []).map(req => ({
    id: req.id,
    fromNickname: req.fromUser?.nickname || "未知用户",
    fromGoalTag: "学习",  // 后端没有 goalTag，先用默认值
    status: "pending",
    createdAt: req.createTime || new Date().toISOString()
  }));
  
  console.log("转换后的申请数据:", requests);
  return requests as FriendRequest[];
}
export async function respondFriendRequest(requestId: string, action: "accept" | "reject") {
  if (useSocialMockApi) {
    return socialMockApi.respondFriendRequest(requestId, action);
  }
  await http.post<ApiResponse<null>>("/social/friend-requests/respond", { requestId: parseInt(requestId), action });
}

export async function fetchFriends() {
  if (useSocialMockApi) {
    return socialMockApi.fetchFriends();
  }
  const { data } = await http.get<ApiResponse<FriendUser[]>>("/social/friends");
  return data.data;
}

export async function fetchFriendVisibility() {
  if (useSocialMockApi) {
    return socialMockApi.getVisibility();
  }
  const { data } = await http.get<ApiResponse<FriendVisibility>>("/social/visibility");
  return data.data;
}

export async function updateFriendVisibility(visibility: FriendVisibility) {
  if (useSocialMockApi) {
    return socialMockApi.updateVisibility(visibility);
  }
  const { data } = await http.post<ApiResponse<FriendVisibility>>("/social/visibility/set", { visibility });
  return data.data;
}

export async function fetchBuddyRecommendations() {
  if (useSocialMockApi) {
    return socialMockApi.fetchBuddyRecommendations();
  }
  const { data } = await http.get<ApiResponse<BuddyRecommendation[]>>("/social/friends/recommend");
  return data.data;
}

export async function fetchCircles(category = "all") {
  if (useSocialMockApi) {
    return socialMockApi.fetchCircles(category);
  }
  const { data } = await http.get<ApiResponse<StudyCircle[]>>("/social/circles", { params: { category } });
  return data.data;
}

export async function joinCircle(circleId: string) {
  if (useSocialMockApi) {
    return socialMockApi.joinCircle(circleId);
  }
  await http.post<ApiResponse<null>>(`/social/circles/join`, { circleId });
}

export async function fetchTeamPosts() {
  if (useSocialMockApi) {
    return socialMockApi.fetchTeamPosts();
  }
  const { data } = await http.get<ApiResponse<TeamPost[]>>("/social/team-posts");
  return data.data;
}

export async function createTeamPost(payload: {
  title: string;
  goal: string;
  headcount: number;
  contact: string;
}) {
  if (useSocialMockApi) {
    return socialMockApi.createTeamPost(payload);
  }
  const { data } = await http.post<ApiResponse<TeamPost>>("/social/team-posts", payload);
  return data.data;
}

export async function fetchTeamChallenges() {
  if (useSocialMockApi) {
    return socialMockApi.fetchTeamChallenges();
  }
  const { data } = await http.get<ApiResponse<TeamChallenge[]>>("/social/teams/challenges");
  return data.data;
}