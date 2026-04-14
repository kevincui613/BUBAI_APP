<template>
  <div class="bg-orb orb-a"></div>
  <div class="bg-orb orb-b"></div>
  <div class="app-shell">
    <header class="topbar panel">
      <div class="brand-block">
        <p class="brand-kicker">StudyPilot V1</p>
        <h1>个性化学习规划平台</h1>
        <p class="muted brand-sub">目标拆分、日历执行、打卡追踪，一屏掌握学习进度。</p>
      </div>

      <nav class="nav-links" v-if="isLoggedIn">
        <RouterLink to="/dashboard" class="nav-link" active-class="nav-link-active">概览</RouterLink>
        <RouterLink to="/goals" class="nav-link" active-class="nav-link-active">目标管理</RouterLink>
        <RouterLink to="/calendar" class="nav-link" active-class="nav-link-active">计划日历</RouterLink>
        <RouterLink to="/social/friends" class="nav-link" active-class="nav-link-active">好友系统</RouterLink>
        <RouterLink to="/social/circles" class="nav-link" active-class="nav-link-active">学习圈子</RouterLink>
        <RouterLink to="/social/teams" class="nav-link" active-class="nav-link-active">搭子组队</RouterLink>
        <RouterLink to="/ai/planner" class="nav-link" active-class="nav-link-active">AI计划</RouterLink>
      </nav>

      <div class="user-block" v-if="isLoggedIn">
        <span class="user-pill">{{ authStore.user?.nickname || "学习者" }}</span>
        <button class="btn-ghost" @click="logout">退出</button>
      </div>

      <div class="user-block" v-else>
        <RouterLink class="btn-ghost" to="/login">登录</RouterLink>
      </div>
    </header>

    <main class="page-wrap">
      <RouterView />
    </main>

    <footer class="footer-note muted">
      <span>StudyPilot V1</span>
      <span class="mode-badge" v-if="isMockMode">演示模式 Mock API</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter, RouterLink, RouterView } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const isLoggedIn = computed(() => !!authStore.accessToken);
const isMockMode = (import.meta.env.VITE_USE_MOCK || "true") === "true";

function logout() {
  authStore.logout();
  router.push("/login");
}

onMounted(() => {
  authStore.loadMe();
});
</script>
