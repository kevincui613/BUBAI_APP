<template>
  <section class="grid-2">
    <!-- 左侧：搜索区域 -->
    <article class="card">
      <div class="section-header">
        <h2 class="card-title">好友系统</h2>
        <span class="badge">搜索 / 添加好友</span>
      </div>

      <div class="inline-actions" style="margin-bottom: 10px">
        <input v-model.trim="keyword" placeholder="输入昵称/邮箱" @keyup.enter="runSearch" />
        <button class="button-secondary" @click="runSearch">搜索</button>
      </div>

      <p class="muted" v-if="socialStore.loading">搜索中...</p>
      <div class="empty" v-else-if="socialStore.candidates.length === 0">暂无匹配用户，换个关键词试试。</div>
      <ul v-else style="margin: 0; padding: 0">
        <li v-for="user in socialStore.candidates" :key="user.id" class="list-item-card">
          <div class="section-header" style="margin: 0 0 8px">
            <strong>{{ user.nickname }}</strong>
            <span class="tag-chip">{{ user.goalTag || "学习" }}</span>
          </div>
          <p class="muted" style="margin: 0 0 6px">{{ user.bio || "这个人很懒" }}</p>
          <p class="muted" style="margin: 0 0 8px">{{ user.city || "未知" }} · 连续打卡 {{ user.streakDays || 0 }} 天</p>
          <div class="inline-actions">
            <span class="match-score">匹配 {{ user.compatibility || 0 }}%</span>
            <button class="button-secondary" @click="handleAddFriend(user.id)" :disabled="user.isFriend">
              {{ user.isFriend ? "已是好友" : "发送申请" }}
            </button>
          </div>
        </li>
      </ul>
    </article>

    <!-- 右侧：好友信息 -->
    <article class="card">
      <div class="section-header">
        <h2 class="card-title">可见性设置</h2>
        <span class="badge">好友动态可见</span>
      </div>
      <select v-model="socialStore.visibility" @change="changeVisibility">
        <option value="public">公开</option>
        <option value="friends">仅好友</option>
        <option value="private">私密</option>
      </select>

      <div class="soft-divider"></div>

      <!-- 我的好友 -->
      <div class="section-header" style="margin: 10px 0">
        <h3 style="margin: 0">我的好友</h3>
        <button class="button-secondary" @click="refreshFriends">刷新</button>
      </div>
      <div v-if="socialStore.friends.length === 0" class="empty">还没有好友，先搜索添加。</div>
      <ul v-else style="margin: 0; padding: 0">
        <li v-for="friend in socialStore.friends" :key="friend.id" class="list-item-card">
          <strong>{{ friend.nickname }}</strong>
          <span class="tag-chip">{{ friend.goalTag || "学习" }}</span>
          <p class="muted">{{ friend.city || "未知" }} · 连续 {{ friend.streakDays || 0 }} 天</p>
        </li>
      </ul>

      <div class="soft-divider"></div>

      <!-- 待处理好友申请 -->
      <div class="section-header" style="margin: 10px 0">
        <h3 style="margin: 0">待处理好友申请</h3>
        <button class="button-secondary" @click="refreshRequests">刷新</button>
      </div>
      <div v-if="socialStore.incomingRequests.length === 0" class="empty">暂无待处理申请。</div>
      <ul v-else style="margin: 0; padding: 0">
        <li v-for="request in socialStore.incomingRequests" :key="request.id" class="list-item-card">
          <div class="section-header" style="margin: 0 0 6px">
            <strong>{{ request.fromNickname }}</strong>
            <span class="tag-chip">{{ request.fromGoalTag || "学习" }}</span>
          </div>
          <div class="inline-actions">
            <button class="button-secondary" @click="handleAccept(request.id)">同意</button>
            <button class="button-secondary" @click="handleReject(request.id)">拒绝</button>
          </div>
        </li>
      </ul>

      <div class="soft-divider"></div>

      <!-- 智能推荐 -->
      <h3>智能推荐搭子</h3>
      <ul style="margin: 0; padding: 0">
        <li v-for="rec in socialStore.recommendations" :key="rec.id" class="list-item-card">
          <strong>{{ rec.nickname }}</strong>
          <span class="match-score">{{ rec.matchScore }}%</span>
          <p class="muted">{{ rec.reason }}</p>
          <button class="button-secondary" @click="handleAddFriend(rec.id)">添加搭子</button>
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useSocialStore } from "@/stores/social";

const socialStore = useSocialStore();
const keyword = ref("");

onMounted(async () => {
  await socialStore.loadFriendsPanel();
  console.log("好友页面加载完成, 申请数量:", socialStore.incomingRequests.length);
});

async function runSearch() {
  console.log("搜索关键词:", keyword.value);
  await socialStore.loadFriendsPanel(keyword.value);
}

async function handleAddFriend(userId: string) {
  console.log("发送申请, userId:", userId);
  try {
    await socialStore.addFriendAndRefresh(userId, keyword.value);
    alert("好友申请已发送！");
  } catch (error: any) {
    console.error("发送失败:", error);
    alert("发送失败: " + (error.message || "请稍后重试"));
  }
}

async function handleAccept(requestId: string) {
  console.log("同意申请, requestId:", requestId);
  try {
    await socialStore.handleFriendRequest(requestId, "accept", keyword.value);
    alert("已同意好友申请！");
  } catch (error: any) {
    console.error("操作失败:", error);
    alert("操作失败: " + (error.message || "请稍后重试"));
  }
}

async function handleReject(requestId: string) {
  console.log("拒绝申请, requestId:", requestId);
  try {
    await socialStore.handleFriendRequest(requestId, "reject", keyword.value);
    alert("已拒绝好友申请！");
  } catch (error: any) {
    console.error("操作失败:", error);
    alert("操作失败: " + (error.message || "请稍后重试"));
  }
}

async function refreshFriends() {
  console.log("刷新好友列表");
  await socialStore.loadFriendsOnly();
}

async function refreshRequests() {
  console.log("刷新待处理申请");
  await socialStore.loadIncomingRequestsOnly();
}

async function changeVisibility() {
  console.log("修改可见性:", socialStore.visibility);
  await socialStore.changeVisibility(socialStore.visibility);
}
</script>