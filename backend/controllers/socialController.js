const { success, errors } = require("../utils/response");
const mock = require("../mockData/index");

// 搜索用户
exports.searchUsers = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.json(errors.PARAM_ERROR("搜索关键词不能为空"));
    }

    // 排除自己，搜索昵称或邮箱
    const results = mock.users
      .filter(u => 
        u.id !== req.user.id && 
        (u.nickname.includes(keyword) || (u.email && u.email.includes(keyword)))
      )
      .map(u => ({
        id: u.id,
        email: u.email,
        nickname: u.nickname
      }));

    return res.json(success(results));
  } catch (err) {
    console.error("搜索用户错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 发送好友申请
exports.sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    if (!friendId) return res.json(errors.PARAM_ERROR("好友ID不能为空"));
    if (userId === friendId) return res.json(errors.PARAM_ERROR("不能添加自己为好友"));

    // 检查目标用户是否存在
    const targetUser = mock.users.find(u => u.id === friendId);
    if (!targetUser) return res.json(errors.NOT_FOUND("目标用户不存在"));

    // 检查是否已是好友
    const isFriend = mock.friendships.some(f => 
      (f.userId === userId && f.friendId === friendId) || 
      (f.userId === friendId && f.friendId === userId)
    );
    if (isFriend) return res.json(errors.PARAM_ERROR("你们已经是好友了"));

    // 检查是否已发送申请
    const hasPending = mock.friendRequests.some(r => 
      (r.fromUserId === userId && r.toUserId === friendId && r.status === "pending") ||
      (r.fromUserId === friendId && r.toUserId === userId && r.status === "pending")
    );
    if (hasPending) return res.json(errors.PARAM_ERROR("已有待处理的好友申请"));

    // 创建申请
    const newRequest = {
      id: mock.friendRequests.length + 1,
      fromUserId: userId,
      toUserId: friendId,
      status: "pending",
      createTime: new Date().toISOString()
    };
    mock.friendRequests.push(newRequest);

    return res.json(success(newRequest, "好友申请已发送"));
  } catch (err) {
    console.error("发送申请错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取收到的好友申请
exports.getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = mock.friendRequests
      .filter(r => r.toUserId === userId && r.status === "pending")
      .map(r => ({
        id: r.id,
        fromUser: mock.users.find(u => u.id === r.fromUserId),
        createTime: r.createTime
      }));

    return res.json(success(requests));
  } catch (err) {
    console.error("获取申请错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 处理好友申请（同意/拒绝）
exports.respondFriendRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = req.user.id;

    if (!requestId || !["accept", "reject"].includes(action)) {
      return res.json(errors.PARAM_ERROR("参数错误"));
    }

    const request = mock.friendRequests.find(r => r.id === requestId);
    if (!request || request.toUserId !== userId || request.status !== "pending") {
      return res.json(errors.NOT_FOUND("申请不存在或已处理"));
    }

    if (action === "accept") {
      // 同意：添加好友关系
      mock.friendships.push({
        userId: request.fromUserId,
        friendId: request.toUserId,
        createTime: new Date().toISOString()
      });
      request.status = "accepted";
      return res.json(success(null, "已同意好友申请"));
    } else {
      // 拒绝：更新状态
      request.status = "rejected";
      return res.json(success(null, "已拒绝好友申请"));
    }
  } catch (err) {
    console.error("处理申请错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取好友列表
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const friends = mock.friendships
      .filter(f => f.userId === userId || f.friendId === userId)
      .map(f => {
        const friendId = f.userId === userId ? f.friendId : f.userId;
        return mock.users.find(u => u.id === friendId);
      })
      .filter(Boolean);

    return res.json(success(friends));
  } catch (err) {
    console.error("获取好友列表错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取可见性设置
exports.getVisibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const visibility = mock.visibilitySettings[userId] || "public";
    return res.json(success({ visibility }, "获取成功"));
  } catch (err) {
    console.error("获取可见性错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 设置可见性
exports.setVisibility = async (req, res) => {
  try {
    const { visibility } = req.body;
    const userId = req.user.id;

    if (!["public", "friends", "private"].includes(visibility)) {
      return res.json(errors.PARAM_ERROR("可见性参数错误"));
    }

    mock.visibilitySettings[userId] = visibility;
    return res.json(success({ visibility }, "可见性设置成功"));
  } catch (err) {
    console.error("设置可见性错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取学习圈列表（P1）
exports.getCircles = async (req, res) => {
  try {
    return res.json(success(mock.circles));
  } catch (err) {
    return res.json(errors.SERVER_ERROR());
  }
};

// 加入学习圈（P1）
exports.joinCircle = async (req, res) => {
  try {
    const { circleId } = req.body;
    const circle = mock.circles.find(c => c.id === Number(circleId));
    if (!circle) return res.json(errors.NOT_FOUND("圈子不存在"));

    return res.json(success(circle, "加入成功"));
  } catch (err) {
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取搭子招募列表（P1）
exports.getTeamPosts = async (req, res) => {
  try {
    return res.json(success(mock.teamPosts));
  } catch (err) {
    return res.json(errors.SERVER_ERROR());
  }
};

// 发布搭子招募（P1）
exports.createTeamPost = async (req, res) => {
  try {
    const { title, content, requirement } = req.body;
    if (!title || !content) return res.json(errors.PARAM_ERROR("标题和内容不能为空"));

    const newPost = {
      id: mock.teamPosts.length + 1,
      userId: req.user.id,
      user: mock.users.find(u => u.id === req.user.id),
      title,
      content,
      requirement,
      createTime: new Date().toISOString()
    };
    mock.teamPosts.push(newPost);

    return res.json(success(newPost, "发布成功"));
  } catch (err) {
    return res.json(errors.SERVER_ERROR());
  }
};

// 搭子推荐（P2）
exports.recommendFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    // 简单推荐：排除自己和已有好友
    const myFriends = mock.friendships
      .filter(f => f.userId === userId || f.friendId === userId)
      .map(f => f.userId === userId ? f.friendId : f.userId);

    const recommendations = mock.users
      .filter(u => u.id !== userId && !myFriends.includes(u.id))
      .slice(0, 5);

    return res.json(success(recommendations));
  } catch (err) {
    return res.json(errors.SERVER_ERROR());
  }
};