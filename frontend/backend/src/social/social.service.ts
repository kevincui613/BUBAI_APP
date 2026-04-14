import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

type FriendVisibility = 'public' | 'friends' | 'private';

export interface FriendUser {
  id: string;
  nickname: string;
  bio: string;
  goalTag: string;
  city: string;
  streakDays: number;
  compatibility: number;
}

interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

@Injectable()
export class SocialService {
  private users: FriendUser[] = [
    {
      id: 'user_demo',
      nickname: '晨光',
      bio: '坚持写作和早起，想找一起冲刺英语的搭子',
      goalTag: '英语',
      city: '杭州',
      streakDays: 14,
      compatibility: 93,
    },
    {
      id: 'user_amy',
      nickname: 'Amy',
      bio: '算法与前端并进，每天 2h',
      goalTag: '算法',
      city: '上海',
      streakDays: 9,
      compatibility: 88,
    },
    {
      id: 'user_ryan',
      nickname: 'Ryan',
      bio: '备考雅思中，互相监督最有效',
      goalTag: '英语',
      city: '北京',
      streakDays: 21,
      compatibility: 96,
    },
  ];

  private friendsByUser: Record<string, string[]> = {
    user_demo: ['user_ryan'],
    user_ryan: ['user_demo'],
  };

  private friendRequests: FriendRequest[] = [
    {
      id: 'fr_seed_1',
      fromUserId: 'user_amy',
      toUserId: 'user_demo',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ];

  private visibilityByUser: Record<string, FriendVisibility> = {
    user_demo: 'friends',
  };

  private circles = [
    {
      id: 'circle_english',
      name: '英语提升营',
      category: '英语',
      intro: '每日听读打卡，周末口语共学',
      memberCount: 268,
    },
    {
      id: 'circle_code',
      name: '算法百题挑战',
      category: '算法',
      intro: '按难度分组，互评解法',
      memberCount: 349,
    },
  ];

  private circleMembers: Record<string, string[]> = {
    circle_english: ['user_demo'],
    circle_code: ['user_demo'],
  };

  private teamPosts = [
    {
      id: 'team_1',
      title: '4周英语听力冲刺小队',
      goal: '每天 45 分钟精听 + 15 分钟跟读',
      headcount: 4,
      currentCount: 2,
      contact: 'vx:study-english',
      createdBy: 'Ryan',
      createdAt: new Date().toISOString(),
    },
  ];

  private teamChallenges = [
    {
      id: 'challenge_1',
      title: '英语连胜 21 天',
      target: '全员完成每日听力任务',
      progress: 72,
      myRank: 2,
      teamSize: 6,
    },
  ];

  private toId(prefix: string) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private ensureUser(userId: string, nickname?: string) {
    const existing = this.users.find((item) => item.id === userId);
    if (existing) {
      if (nickname && nickname.trim()) {
        existing.nickname = nickname.trim();
      }
      return;
    }

    this.users.push({
      id: userId,
      nickname: nickname?.trim() || '新同学',
      bio: '刚加入平台，正在制定学习计划',
      goalTag: '综合提升',
      city: '未知',
      streakDays: 0,
      compatibility: 75,
    });
  }

  private hasFriendship(a: string, b: string) {
    return (this.friendsByUser[a] || []).includes(b);
  }

  private relationStatus(currentUserId: string, targetUserId: string) {
    if (this.hasFriendship(currentUserId, targetUserId)) return 'friend';
    const pending = this.friendRequests.find(
      (item) =>
        item.status === 'pending' &&
        ((item.fromUserId === currentUserId && item.toUserId === targetUserId) ||
          (item.fromUserId === targetUserId && item.toUserId === currentUserId)),
    );
    if (!pending) return 'none';
    return pending.fromUserId === currentUserId ? 'pendingSent' : 'pendingReceived';
  }

  searchUsers(currentUserId: string, keyword = '', nickname?: string) {
    this.ensureUser(currentUserId, nickname);
    const kw = keyword.trim().toLowerCase();

    return this.users
      .filter((item) => item.id !== currentUserId)
      .filter((item) => {
        if (!kw) return true;
        return [item.nickname, item.goalTag, item.city, item.bio].join(' ').toLowerCase().includes(kw);
      })
      .map((item) => {
        const status = this.relationStatus(currentUserId, item.id);
        return {
          ...item,
          isFriend: status === 'friend',
          requestStatus: status === 'friend' ? 'none' : status,
        };
      })
      .sort((a, b) => b.compatibility - a.compatibility);
  }

  sendFriendRequest(currentUserId: string, targetUserId: string, nickname?: string) {
    this.ensureUser(currentUserId, nickname);
    if (targetUserId === currentUserId) {
      throw new BadRequestException('不能添加自己');
    }

    const status = this.relationStatus(currentUserId, targetUserId);
    if (status !== 'none') {
      throw new BadRequestException('当前关系状态不允许重复发起申请');
    }

    this.friendRequests.push({
      id: this.toId('fr'),
      fromUserId: currentUserId,
      toUserId: targetUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  fetchIncomingRequests(currentUserId: string, nickname?: string) {
    this.ensureUser(currentUserId, nickname);
    return this.friendRequests
      .filter((item) => item.status === 'pending' && item.toUserId === currentUserId)
      .map((item) => {
        const from = this.users.find((u) => u.id === item.fromUserId);
        return {
          id: item.id,
          fromUserId: item.fromUserId,
          toUserId: item.toUserId,
          fromNickname: from?.nickname || '未知用户',
          fromGoalTag: from?.goalTag || '综合提升',
          status: item.status,
          createdAt: item.createdAt,
        };
      });
  }

  respondFriendRequest(currentUserId: string, requestId: string, action: 'accept' | 'reject', nickname?: string) {
    this.ensureUser(currentUserId, nickname);
    const request = this.friendRequests.find((item) => item.id === requestId && item.toUserId === currentUserId);
    if (!request || request.status !== 'pending') {
      throw new NotFoundException('请求不存在或已处理');
    }

    if (action === 'accept') {
      request.status = 'accepted';
      const mine = new Set(this.friendsByUser[currentUserId] || []);
      mine.add(request.fromUserId);
      this.friendsByUser[currentUserId] = Array.from(mine);

      const other = new Set(this.friendsByUser[request.fromUserId] || []);
      other.add(currentUserId);
      this.friendsByUser[request.fromUserId] = Array.from(other);
    } else {
      request.status = 'rejected';
    }
  }

  fetchFriends(currentUserId: string, nickname?: string) {
    this.ensureUser(currentUserId, nickname);
    const friendIds = new Set(this.friendsByUser[currentUserId] || []);
    return this.users.filter((item) => friendIds.has(item.id));
  }

  getVisibility(currentUserId: string): FriendVisibility {
    return this.visibilityByUser[currentUserId] || 'friends';
  }

  updateVisibility(currentUserId: string, visibility: FriendVisibility) {
    this.visibilityByUser[currentUserId] = visibility;
    return visibility;
  }

  fetchBuddyRecommendations(currentUserId: string) {
    this.ensureUser(currentUserId);
    return this.users
      .filter((item) => item.id !== currentUserId)
      .filter((item) => this.relationStatus(currentUserId, item.id) === 'none')
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        nickname: item.nickname,
        reason: `学习方向${item.goalTag}相近，连续打卡${item.streakDays}天`,
        matchScore: item.compatibility,
        goalTag: item.goalTag,
        city: item.city,
      }));
  }

  fetchCircles(currentUserId: string, category = 'all', nickname?: string) {
    this.ensureUser(currentUserId, nickname);
    return this.circles
      .filter((item) => (category === 'all' ? true : item.category === category))
      .map((item) => ({
        ...item,
        isJoined: (this.circleMembers[item.id] || []).includes(currentUserId),
      }));
  }

  joinCircle(currentUserId: string, circleId: string, nickname?: string) {
    this.ensureUser(currentUserId, nickname);
    const members = new Set(this.circleMembers[circleId] || []);
    members.add(currentUserId);
    this.circleMembers[circleId] = Array.from(members);
  }

  fetchTeamPosts() {
    return [...this.teamPosts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  createTeamPost(
    currentUserId: string,
    payload: { title: string; goal: string; headcount: number; contact: string },
    nickname?: string,
  ) {
    this.ensureUser(currentUserId, nickname);
    const me = this.users.find((item) => item.id === currentUserId);
    const post = {
      id: this.toId('team'),
      title: payload.title,
      goal: payload.goal,
      headcount: payload.headcount,
      currentCount: 1,
      contact: payload.contact,
      createdBy: me?.nickname || '匿名用户',
      createdAt: new Date().toISOString(),
    };
    this.teamPosts.unshift(post);
    return post;
  }

  fetchTeamChallenges() {
    return this.teamChallenges;
  }
}
