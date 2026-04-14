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
  users: FriendUser[];
  friendsByUser: Record<string, string[]>;
  friendRequests: Array<{
    id: string;
    fromUserId: string;
    toUserId: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
  }>;
  visibilityByUser: Record<string, FriendVisibility>;
  circles: Array<{
    id: string;
    name: string;
    category: string;
    intro: string;
    memberCount: number;
  }>;
  circleMembers: Record<string, string[]>;
  teamPosts: TeamPost[];
  teamChallenges: TeamChallenge[];
}

const DB_KEY = "lp_v1_social_db";

function delay(ms = 160) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseUserIdFromToken() {
  const token = localStorage.getItem("accessToken");
  if (!token || !token.startsWith("mock-token-")) {
    throw new Error("未登录");
  }
  return token.replace("mock-token-", "");
}

function toId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seedState(): SocialState {
  const users: FriendUser[] = [
    {
      id: "user_demo",
      nickname: "晨光",
      bio: "坚持写作和早起，想找一起冲刺英语的搭子",
      goalTag: "英语",
      city: "杭州",
      streakDays: 14,
      compatibility: 93
    },
    {
      id: "user_amy",
      nickname: "Amy",
      bio: "算法与前端并进，每天 2h",
      goalTag: "算法",
      city: "上海",
      streakDays: 9,
      compatibility: 88
    },
    {
      id: "user_ryan",
      nickname: "Ryan",
      bio: "备考雅思中，互相监督最有效",
      goalTag: "英语",
      city: "北京",
      streakDays: 21,
      compatibility: 96
    },
    {
      id: "user_mia",
      nickname: "Mia",
      bio: "产品经理转型数据分析",
      goalTag: "数据分析",
      city: "深圳",
      streakDays: 7,
      compatibility: 82
    },
    {
      id: "user_luna",
      nickname: "Luna",
      bio: "每天刷题 90 分钟，周末复盘",
      goalTag: "算法",
      city: "成都",
      streakDays: 16,
      compatibility: 90
    }
  ];

  const circles = [
    {
      id: "circle_english",
      name: "英语提升营",
      category: "英语",
      intro: "每日听读打卡，周末口语共学",
      memberCount: 268
    },
    {
      id: "circle_code",
      name: "算法百题挑战",
      category: "算法",
      intro: "按难度分组，互评解法",
      memberCount: 349
    },
    {
      id: "circle_pm",
      name: "产品实战圈",
      category: "产品",
      intro: "真实需求拆解与案例复盘",
      memberCount: 152
    },
    {
      id: "circle_data",
      name: "数据分析入门圈",
      category: "数据分析",
      intro: "表格、SQL、可视化协同学习",
      memberCount: 205
    }
  ];

  const teamPosts: TeamPost[] = [
    {
      id: "team_1",
      title: "4周英语听力冲刺小队",
      goal: "每天 45 分钟精听 + 15 分钟跟读",
      headcount: 4,
      currentCount: 2,
      contact: "vx:study-english",
      createdBy: "Ryan",
      createdAt: new Date().toISOString()
    },
    {
      id: "team_2",
      title: "算法刷题 30 天挑战",
      goal: "工作日 2 题，周末错题复盘",
      headcount: 5,
      currentCount: 3,
      contact: "tg:@algo_team",
      createdBy: "Luna",
      createdAt: new Date().toISOString()
    }
  ];

  const teamChallenges: TeamChallenge[] = [
    {
      id: "challenge_1",
      title: "英语连胜 21 天",
      target: "全员完成每日听力任务",
      progress: 72,
      myRank: 2,
      teamSize: 6
    },
    {
      id: "challenge_2",
      title: "刷题周榜",
      target: "本周总提交 >= 30 题",
      progress: 58,
      myRank: 3,
      teamSize: 8
    }
  ];

  return {
    users,
    friendsByUser: {
      user_demo: ["user_ryan", "user_luna"],
      user_ryan: ["user_demo"],
      user_luna: ["user_demo"]
    },
    friendRequests: [
      {
        id: "fr_seed_1",
        fromUserId: "user_amy",
        toUserId: "user_demo",
        status: "pending",
        createdAt: new Date().toISOString()
      }
    ],
    visibilityByUser: {
      user_demo: "friends"
    },
    circles,
    circleMembers: {
      circle_english: ["user_demo"],
      circle_code: ["user_demo"],
      circle_pm: [],
      circle_data: []
    },
    teamPosts,
    teamChallenges
  };
}

function readState(): SocialState {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const seeded = seedState();
    writeState(seeded);
    return seeded;
  }
  try {
    return JSON.parse(raw) as SocialState;
  } catch {
    const seeded = seedState();
    writeState(seeded);
    return seeded;
  }
}

function writeState(state: SocialState) {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
}

function ensureCurrentUser(state: SocialState, userId: string) {
  const existing = state.users.find((item) => item.id === userId);
  if (existing) return;

  state.users.push({
    id: userId,
    nickname: "新同学",
    bio: "刚加入平台，正在制定学习计划",
    goalTag: "综合提升",
    city: "未知",
    streakDays: 0,
    compatibility: 75
  });

  state.friendRequests.push({
    id: toId("fr"),
    fromUserId: "user_amy",
    toUserId: userId,
    status: "pending",
    createdAt: new Date().toISOString()
  });
}

function hasFriendship(state: SocialState, a: string, b: string) {
  return (state.friendsByUser[a] || []).includes(b);
}

function requestStatus(state: SocialState, currentUserId: string, targetUserId: string) {
  if (hasFriendship(state, currentUserId, targetUserId)) return "friend";

  const pending = state.friendRequests.find(
    (item) =>
      item.status === "pending" &&
      ((item.fromUserId === currentUserId && item.toUserId === targetUserId) ||
        (item.fromUserId === targetUserId && item.toUserId === currentUserId))
  );

  if (!pending) return "none";
  return pending.fromUserId === currentUserId ? "pendingSent" : "pendingReceived";
}

function buildFriendRequests(state: SocialState, currentUserId: string): FriendRequest[] {
  return state.friendRequests
    .filter((item) => item.status === "pending" && item.toUserId === currentUserId)
    .map((item) => {
      const from = state.users.find((u) => u.id === item.fromUserId);
      return {
        id: item.id,
        fromUserId: item.fromUserId,
        toUserId: item.toUserId,
        fromNickname: from?.nickname || "未知用户",
        fromGoalTag: from?.goalTag || "综合提升",
        status: item.status,
        createdAt: item.createdAt
      };
    })
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export const socialMockApi = {
  async searchUsers(keyword: string): Promise<FriendCandidate[]> {
    await delay();
    const state = readState();
    const currentUserId = parseUserIdFromToken();
    ensureCurrentUser(state, currentUserId);

    const kw = keyword.trim().toLowerCase();

    return state.users
      .filter((item) => item.id !== currentUserId)
      .filter((item) => {
        if (!kw) return true;
        return [item.nickname, item.goalTag, item.city, item.bio].join(" ").toLowerCase().includes(kw);
      })
      .map((item) => {
        const status = requestStatus(state, currentUserId, item.id);
        return {
          ...item,
          isFriend: status === "friend",
          requestStatus: status === "friend" ? "none" : status
        } as FriendCandidate;
      })
      .sort((a, b) => b.compatibility - a.compatibility);
  },

  async sendFriendRequest(targetUserId: string): Promise<void> {
    await delay(120);
    const state = readState();
    const currentUserId = parseUserIdFromToken();
    ensureCurrentUser(state, currentUserId);

    if (targetUserId === currentUserId) {
      throw new Error("不能添加自己");
    }

    const status = requestStatus(state, currentUserId, targetUserId);
    if (status === "friend") {
      throw new Error("已是好友");
    }
    if (status === "pendingSent") {
      throw new Error("已发送申请，请等待对方同意");
    }
    if (status === "pendingReceived") {
      throw new Error("对方已向你发送申请，请先同意");
    }

    state.friendRequests.push({
      id: toId("fr"),
      fromUserId: currentUserId,
      toUserId: targetUserId,
      status: "pending",
      createdAt: new Date().toISOString()
    });
    writeState(state);
  },

  async fetchIncomingRequests(): Promise<FriendRequest[]> {
    await delay(100);
    const state = readState();
    const currentUserId = parseUserIdFromToken();
    ensureCurrentUser(state, currentUserId);
    return buildFriendRequests(state, currentUserId);
  },

  async respondFriendRequest(requestId: string, action: "accept" | "reject"): Promise<void> {
    await delay(100);
    const state = readState();
    const currentUserId = parseUserIdFromToken();

    const request = state.friendRequests.find((item) => item.id === requestId && item.toUserId === currentUserId);
    if (!request || request.status !== "pending") {
      throw new Error("请求不存在或已处理");
    }

    if (action === "accept") {
      request.status = "accepted";

      const mine = new Set(state.friendsByUser[currentUserId] || []);
      mine.add(request.fromUserId);
      state.friendsByUser[currentUserId] = Array.from(mine);

      const other = new Set(state.friendsByUser[request.fromUserId] || []);
      other.add(currentUserId);
      state.friendsByUser[request.fromUserId] = Array.from(other);
    } else {
      request.status = "rejected";
    }

    writeState(state);
  },

  async fetchFriends(): Promise<FriendUser[]> {
    await delay(100);
    const state = readState();
    const currentUserId = parseUserIdFromToken();
    ensureCurrentUser(state, currentUserId);

    const friendIds = new Set(state.friendsByUser[currentUserId] || []);
    return state.users.filter((item) => friendIds.has(item.id));
  },

  async getVisibility(): Promise<FriendVisibility> {
    await delay(80);
    const state = readState();
    const currentUserId = parseUserIdFromToken();
    return state.visibilityByUser[currentUserId] || "friends";
  },

  async updateVisibility(visibility: FriendVisibility): Promise<FriendVisibility> {
    await delay(80);
    const state = readState();
    const currentUserId = parseUserIdFromToken();
    state.visibilityByUser[currentUserId] = visibility;
    writeState(state);
    return visibility;
  },

  async fetchBuddyRecommendations(): Promise<BuddyRecommendation[]> {
    await delay(120);
    const state = readState();
    const currentUserId = parseUserIdFromToken();

    return state.users
      .filter((item) => item.id !== currentUserId)
      .filter((item) => requestStatus(state, currentUserId, item.id) === "none")
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        nickname: item.nickname,
        reason: `学习方向${item.goalTag}相近，连续打卡${item.streakDays}天`,
        matchScore: item.compatibility,
        goalTag: item.goalTag,
        city: item.city
      }));
  },

  async fetchCircles(category = "all"): Promise<StudyCircle[]> {
    await delay(120);
    const state = readState();
    const currentUserId = parseUserIdFromToken();

    return state.circles
      .filter((item) => (category === "all" ? true : item.category === category))
      .map((item) => ({
        ...item,
        isJoined: (state.circleMembers[item.id] || []).includes(currentUserId)
      }));
  },

  async joinCircle(circleId: string): Promise<void> {
    await delay(100);
    const state = readState();
    const currentUserId = parseUserIdFromToken();

    const members = new Set(state.circleMembers[circleId] || []);
    members.add(currentUserId);
    state.circleMembers[circleId] = Array.from(members);

    const circle = state.circles.find((item) => item.id === circleId);
    if (circle) {
      circle.memberCount = Math.max(circle.memberCount, state.circleMembers[circleId].length + circle.memberCount - 1);
    }

    writeState(state);
  },

  async fetchTeamPosts(): Promise<TeamPost[]> {
    await delay(120);
    const state = readState();
    return state.teamPosts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  async createTeamPost(payload: {
    title: string;
    goal: string;
    headcount: number;
    contact: string;
  }): Promise<TeamPost> {
    await delay(150);
    const state = readState();
    const currentUserId = parseUserIdFromToken();
    const me = state.users.find((item) => item.id === currentUserId);

    const post: TeamPost = {
      id: toId("team"),
      title: payload.title,
      goal: payload.goal,
      headcount: payload.headcount,
      currentCount: 1,
      contact: payload.contact,
      createdBy: me?.nickname || "匿名用户",
      createdAt: new Date().toISOString()
    };

    state.teamPosts.unshift(post);
    writeState(state);
    return post;
  },

  async fetchTeamChallenges(): Promise<TeamChallenge[]> {
    await delay(120);
    const state = readState();
    return state.teamChallenges;
  }
};
