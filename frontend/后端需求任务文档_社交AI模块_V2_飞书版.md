# 学习规划平台 社交 + AI 模块需求（V2）

## 1. 目标
- 在现有 V1（登录、目标、日历、打卡）基础上，新增社交与智能能力。
- 本文重点覆盖：好友系统、学习圈子、搭子组队、AI 计划生成、搭子推荐。

## 2. 功能范围

### 2.1 好友系统（P2）
- 搜索用户并添加好友
- 好友动态可见性设置：public / friends / private
- 智能推荐搭子列表

### 2.2 学习圈子（P2）
- 按学习目标分类展示圈子
- 用户加入圈子

### 2.3 搭子组队（P2-P3）
- 发布招募帖（标题、目标、人数、联系方式）
- 查看招募大厅
- 组队打卡挑战（P3）

### 2.4 AI 能力（P2）
- 根据目标、周期、每日投入、水平生成学习计划
- 返回分日任务和执行建议

## 3. 字段与响应规范
- API 字段：camelCase
- 日期：YYYY-MM-DD
- 时间：ISO 字符串
- 主键：string
- 统一响应体
  - code: number
  - message: string
  - data: any

## 4. 数据库设计建议

### 4.1 social_users_profile
- id (PK)
- userId (FK -> users.id, unique)
- bio
- goalTag
- city
- streakDays
- createdAt
- updatedAt

### 4.2 friendships
- id (PK)
- userId
- friendUserId
- status (pending/accepted/blocked)
- createdAt
- updatedAt
- unique(userId, friendUserId)

### 4.3 social_visibility_settings
- id (PK)
- userId (unique)
- visibility (public/friends/private)
- updatedAt

### 4.4 circles
- id (PK)
- name
- category
- intro
- memberCount
- createdAt

### 4.5 circle_members
- id (PK)
- circleId
- userId
- joinedAt
- unique(circleId, userId)

### 4.6 team_posts
- id (PK)
- userId
- title
- goal
- headcount
- currentCount
- contact
- createdAt
- updatedAt

### 4.7 team_challenges
- id (PK)
- title
- target
- progress
- createdAt
- updatedAt

### 4.8 team_challenge_members
- id (PK)
- challengeId
- userId
- rank
- createdAt

### 4.9 ai_plan_records
- id (PK)
- userId
- goalTitle
- periodDays
- dailyMinutes
- level
- summary
- rawResultJson
- createdAt

## 5. API 清单

## 5.1 好友系统
1) GET /api/v1/social/friends/search?keyword=xxx
- 返回候选用户列表（含 isFriend）

2) POST /api/v1/social/friends/add
- req: { targetUserId }
- 行为：建立双向 accepted 好友关系

3) GET /api/v1/social/friends
- 返回我的好友列表

4) GET /api/v1/social/friends/visibility
- 返回可见性设置

5) PATCH /api/v1/social/friends/visibility
- req: { visibility }
- 返回最新 visibility

6) GET /api/v1/social/friends/recommendations
- 返回推荐搭子列表
- 字段：id, nickname, reason, matchScore, goalTag, city

## 5.2 学习圈子
7) GET /api/v1/social/circles?category=all
- 返回圈子列表
- 字段包含 isJoined

8) POST /api/v1/social/circles/:circleId/join
- 加入圈子

## 5.3 搭子组队
9) GET /api/v1/social/teams/posts
- 返回招募帖列表

10) POST /api/v1/social/teams/posts
- req: { title, goal, headcount, contact }
- 返回创建后的招募帖

11) GET /api/v1/social/teams/challenges
- 返回挑战列表

## 5.4 AI 计划
12) POST /api/v1/ai/plans/generate
- req:
  - goalTitle: string
  - periodDays: number
  - dailyMinutes: number
  - level: beginner/intermediate/advanced
- res.data:
  - summary: string
  - tips: string[]
  - tasks: [{ day, focus, minutes, deliverable }]

## 6. 推荐逻辑建议（搭子）
- 可基于加权打分：
  - 目标标签相同：40%
  - 连续打卡相近：20%
  - 可用时段重叠：20%
  - 城市/时区接近：10%
  - 历史互动质量：10%
- 输出 matchScore（0-100）与 reason 文案。

## 7. AI 模型接入建议
- 仅后端调用大模型，前端不持有密钥
- 环境变量
  - LLM_API_KEY
  - LLM_BASE_URL
  - LLM_MODEL
- 需要超时、重试、降级兜底（失败返回模板计划）
- 建议记录 prompt 与结果摘要到 ai_plan_records

## 8. 联调要求
- 鉴权：Bearer JWT
- CORS 允许 http://localhost:5173 和 http://localhost:5174
- 接口命名与字段必须与第 5 节一致

## 9. 验收标准
- 用户可搜索并添加好友、设置可见性
- 可按分类浏览并加入圈子
- 可发布招募帖并看到大厅列表
- 可查看组队挑战进度
- 可调用 AI 生成计划并返回分日任务
