<template>
  <section class="grid-2">
    <article class="card">
      <div class="section-header">
        <h2 class="card-title">创建学习目标</h2>
        <span class="badge">自动拆分每日任务</span>
      </div>

      <form class="form" @submit.prevent="submitGoal">
        <input v-model.trim="form.title" placeholder="目标标题" required />
        <textarea v-model.trim="form.description" placeholder="目标描述（可选）" rows="3" />
        <input v-model.number="form.targetTotal" type="number" min="1" placeholder="总目标量" required />
        <input v-model.trim="form.unit" placeholder="单位，例如 hour/page" required />
        <label>
          开始日期
          <input v-model="form.startDate" type="date" required />
        </label>
        <label>
          结束日期
          <input v-model="form.endDate" type="date" required />
        </label>
        <p class="error" v-if="errorMsg">{{ errorMsg }}</p>
        <button class="button-primary" :disabled="loading">{{ loading ? "提交中..." : "创建目标" }}</button>
      </form>
    </article>

    <article class="card">
      <div class="section-header">
        <h2 class="card-title">目标列表</h2>
        <div class="inline-actions">
          <select v-model="statusFilter" @change="loadGoals">
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="archived">已归档</option>
          </select>
          <button class="button-secondary" @click="loadGoals">刷新</button>
        </div>
      </div>

      <p class="muted" v-if="goalsStore.loading">加载中...</p>
      <div class="empty" v-else-if="goalsStore.goals.length === 0">还没有目标，先创建第一个学习计划。</div>
      <ul v-else style="margin: 0; padding: 0">
        <li v-for="goal in goalsStore.goals" :key="goal.id" class="list-item-card">
          <strong>{{ goal.title }}</strong>
          <div class="muted">周期：{{ goal.startDate }} ~ {{ goal.endDate }}</div>
          <div>目标量：{{ goal.targetTotal }} {{ goal.unit }}</div>
          <div class="muted">建议日均：{{ dailyAmount(goal.targetTotal, goal.startDate, goal.endDate) }} {{ goal.unit }}</div>
          <span class="badge" style="margin-top: 6px">{{ goal.status === 'active' ? '进行中' : goal.status === 'completed' ? '已完成' : '已归档' }}</span>
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import dayjs from "dayjs";
import { useGoalsStore } from "@/stores/goals";

const goalsStore = useGoalsStore();
const loading = ref(false);
const errorMsg = ref("");
const statusFilter = ref("active");

const form = reactive({
  title: "",
  description: "",
  targetTotal: 1,
  unit: "hour",
  startDate: dayjs().format("YYYY-MM-DD"),
  endDate: dayjs().add(29, "day").format("YYYY-MM-DD")
});

onMounted(() => {
  loadGoals();
});

async function loadGoals() {
  await goalsStore.loadGoals(statusFilter.value);
}

async function submitGoal() {
  if (!form.title.trim()) {
    errorMsg.value = "请输入目标标题";
    return;
  }
  if (dayjs(form.endDate).isBefore(dayjs(form.startDate), "day")) {
    errorMsg.value = "结束日期不能早于开始日期";
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  try {
    await goalsStore.addGoal(form);
    alert("目标创建成功！");
    // 重置表单
    form.title = "";
    form.description = "";
    form.targetTotal = 1;
    form.unit = "hour";
    form.startDate = dayjs().format("YYYY-MM-DD");
    form.endDate = dayjs().add(29, "day").format("YYYY-MM-DD");
    // 刷新列表
    await loadGoals();
  } catch (error: any) {
    console.error("创建目标错误:", error);
    errorMsg.value = error.message || "创建目标失败，请稍后重试";
  } finally {
    loading.value = false;
  }
}

function dailyAmount(total: number, startDate: string, endDate: string) {
  const days = Math.max(1, dayjs(endDate).diff(dayjs(startDate), "day") + 1);
  return (total / days).toFixed(1);
}
</script>