const users = [
  {
    id: 1,
    email: "demo@study.local",
    nickname: "演示用户",
    password: "123456"  // 明文密码
  },
  {
    id: 2,
    email: "friend@test.com",
    nickname: "测试好友",
    password: "123456"
  }
];

// 模拟好友关系
const friendships = [];

// 模拟好友申请
const friendRequests = [];

// 模拟可见性设置
const visibilitySettings = {};

// 模拟学习圈
const circles = [
  { id: 1, name: "前端学习圈", description: "Vue/React技术交流" },
  { id: 2, name: "AI智能体圈", description: "大模型应用开发" }
];

// 模拟搭子招募帖
const teamPosts = [];

// 模拟目标
const goals = [];

// 模拟任务
const tasks = [];

module.exports = {
  users,
  friendships,
  friendRequests,
  visibilitySettings,
  circles,
  teamPosts,
  goals,
  tasks,
  // 导出常量，方便其他地方使用
  DEMO_EMAIL: "demo@study.local",
  DEMO_PASSWORD: "123456",
  DEMO_NICKNAME: "演示用户"
};