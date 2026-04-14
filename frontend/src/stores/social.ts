import { defineStore } from "pinia";
import {
  createTeamPost,
  fetchBuddyRecommendations,
  fetchCircles,
  fetchFriendVisibility,
  fetchFriends,
  fetchIncomingFriendRequests,
  fetchTeamChallenges,
  fetchTeamPosts,
  joinCircle,
  respondFriendRequest,
  searchUsers,
  sendFriendRequest,
  updateFriendVisibility
} from "@/api/social";
import type {
  BuddyRecommendation,
  FriendCandidate,
  FriendRequest,
  FriendUser,
  FriendVisibility,
  StudyCircle,
  TeamChallenge,
  TeamPost
} from "@/types";

interface SocialState {
  friends: FriendUser[];
  incomingRequests: FriendRequest[];
  candidates: FriendCandidate[];
  recommendations: BuddyRecommendation[];
  visibility: FriendVisibility;
  circles: StudyCircle[];
  teamPosts: TeamPost[];
  teamChallenges: TeamChallenge[];
  loading: boolean;
}

export const useSocialStore = defineStore("social", {
  state: (): SocialState => ({
    friends: [],
    incomingRequests: [],
    candidates: [],
    recommendations: [],
    visibility: "friends",
    circles: [],
    teamPosts: [],
    teamChallenges: [],
    loading: false
  }),
  actions: {
    async loadFriendsPanel(keyword = "") {
      this.loading = true;
      try {
        const [friends, candidates, recommendations, visibility, incomingRequests] = await Promise.all([
          fetchFriends(),
          searchUsers(keyword),
          fetchBuddyRecommendations(),
          fetchFriendVisibility(),
          fetchIncomingFriendRequests()
        ]);
        // 确保所有数据都是数组，避免 "candidates is not iterable" 错误
        this.friends = Array.isArray(friends) ? [...friends] : [];
        this.candidates = Array.isArray(candidates) ? [...candidates] : [];
        this.recommendations = Array.isArray(recommendations) ? [...recommendations] : [];
        this.visibility = visibility || "friends";
        this.incomingRequests = Array.isArray(incomingRequests) ? [...incomingRequests] : [];
        console.log("loadFriendsPanel 完成，好友:", this.friends.length, "申请:", this.incomingRequests.length);
      } catch (error) {
        console.error("loadFriendsPanel 错误:", error);
        // 出错时确保数据为空数组
        this.friends = [];
        this.candidates = [];
        this.recommendations = [];
        this.incomingRequests = [];
      } finally {
        this.loading = false;
      }
    },

    // 只刷新待处理申请
    async loadIncomingRequestsOnly() {
      try {
        const requests = await fetchIncomingFriendRequests();
        this.incomingRequests = Array.isArray(requests) ? [...requests] : [];
        console.log("loadIncomingRequestsOnly 完成，申请数量:", this.incomingRequests.length);
      } catch (error) {
        console.error("刷新申请失败:", error);
        this.incomingRequests = [];
      }
    },

    // 只刷新好友列表
    async loadFriendsOnly() {
      try {
        const friends = await fetchFriends();
        this.friends = Array.isArray(friends) ? [...friends] : [];
        console.log("loadFriendsOnly 完成，好友数量:", this.friends.length);
      } catch (error) {
        console.error("刷新好友列表失败:", error);
        this.friends = [];
      }
    },

    async addFriendAndRefresh(targetUserId: string, keyword = "") {
      await sendFriendRequest(targetUserId);
      await this.loadFriendsPanel(keyword);
    },

    async handleFriendRequest(requestId: string, action: "accept" | "reject", keyword = "") {
      await respondFriendRequest(requestId, action);
      await this.loadFriendsPanel(keyword);
    },

    async changeVisibility(visibility: FriendVisibility) {
      this.visibility = await updateFriendVisibility(visibility);
    },

    async loadCircles(category = "all") {
      this.circles = await fetchCircles(category);
    },

    async joinAndRefresh(circleId: string, category = "all") {
      await joinCircle(circleId);
      await this.loadCircles(category);
    },

    async loadTeams() {
      const [posts, challenges] = await Promise.all([fetchTeamPosts(), fetchTeamChallenges()]);
      this.teamPosts = posts;
      this.teamChallenges = challenges;
    },

    async createPostAndRefresh(payload: { title: string; goal: string; headcount: number; contact: string }) {
      await createTeamPost(payload);
      await this.loadTeams();
    }
  }
});