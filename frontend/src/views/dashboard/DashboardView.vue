<template>
  <section class="grid-2">
    <article class="card">
      <div class="section-header">
        <h2 class="card-title">学习概览</h2>
        <span class="badge">V1 演示</span>
      </div>

      <p class="muted">今天的投入会决定你这周的曲线。</p>

      <div class="grid-3" v-if="overview" style="margin-top: 14px">
        <div class="card">
          <p class="muted">连续打卡</p>
          <p class="kpi-number">{{ overview.currentStreakDays }}</p>
          <p class="muted">天</p>
        </div>
        <div class="card">
          <p class="muted">本周完成率</p>
          <p class="kpi-number">{{ overview.weeklyCompletionRate }}%</p>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${overview.weeklyCompletionRate}%` }"></div>
          </div>
        </div>
        <div class="card">
          <p class="muted">今日完成任务</p>
          <p class="kpi-number">{{ overview.todayCompletedTasks }}/{{ overview.todayTotalTasks }}</p>
          <p class="muted">任务</p>
        </div>
        <div class="card">
          <p class="muted">进行中目标</p>
          <p class="kpi-number">{{ activeGoalsCount }}</p>
          <p class="muted">个</p>
        </div>
      </div>

      <p v-else class="muted">加载中...</p>
    </article>

    <article class="card">
      <h2 class="card-title">当前版本说明</h2>
      <ul>
        <li>已支持注册/登录、目标创建、计划日历、任务打卡。</li>
        <li>当前数据为本地 Mock，可完整演示主流程。</li>
        <li>后续接入后端后无需改页面结构，只需切换接口。</li>
      </ul>

      <div class="card" style="margin-top: 14px">
        <p class="muted">演示账号</p>
        <p><strong>demo@study.local</strong> / <strong>123456</strong></p>
      </div>

      <div class="inline-actions" style="margin-top: 12px">
        <RouterLink class="button-secondary" to="/goals">去创建目标</RouterLink>
        <RouterLink class="button-secondary" to="/calendar">去日历打卡</RouterLink>
        <button class="button-secondary" v-if="isMockMode" @click="resetDemo">重置演示数据</button>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useTasksStore } from "@/stores/tasks";
import { useGoalsStore } from "@/stores/goals";
import { resetMockData } from "@/mock/mock-api";
import { useAuthStore } from "@/stores/auth";

const tasksStore = useTasksStore();
const goalsStore = useGoalsStore();
const authStore = useAuthStore();
const router = useRouter();
const overview = computed(() => tasksStore.overview);
const activeGoalsCount = computed(() => goalsStore.goals.length);
const isMockMode = (import.meta.env.VITE_USE_MOCK || "true") === "true";

onMounted(() => {
  tasksStore.loadOverview();
  goalsStore.loadGoals("active");
});

function resetDemo() {
  resetMockData();
  authStore.logout();
  router.push("/login");
}
</script>
