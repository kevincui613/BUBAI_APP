<template>
  <section class="grid-2">
    <article class="card">
      <div class="section-header">
        <h2 class="card-title">AI 学习计划生成</h2>
        <span class="badge">大模型能力入口</span>
      </div>

      <form class="form" @submit.prevent="generate">
        <input v-model.trim="form.goalTitle" placeholder="学习目标，例如 雅思 7.0 冲刺" required />
        <input v-model.number="form.periodDays" type="number" min="3" max="30" placeholder="计划周期（天）" required />
        <input v-model.number="form.dailyMinutes" type="number" min="20" max="300" placeholder="每日投入（分钟）" required />
        <select v-model="form.level">
          <option value="beginner">入门</option>
          <option value="intermediate">进阶</option>
          <option value="advanced">冲刺</option>
        </select>
        <p class="error" v-if="aiStore.errorMessage">{{ aiStore.errorMessage }}</p>
        <button class="button-primary" :disabled="aiStore.loading">{{ aiStore.loading ? "生成中..." : "生成计划" }}</button>
      </form>
    </article>

    <article class="card">
      <div class="section-header">
        <h2 class="card-title">计划结果</h2>
        <button class="button-secondary" @click="aiStore.clearPlan()">清空</button>
      </div>

      <div class="empty" v-if="!aiStore.plan">填写左侧信息后生成计划。</div>
      <div v-else>
        <p>{{ aiStore.plan.summary }}</p>

        <div class="soft-divider"></div>

        <h3 style="margin: 0 0 8px">执行建议</h3>
        <ul style="margin: 0 0 12px; padding-left: 18px">
          <li v-for="tip in aiStore.plan.tips" :key="tip" class="muted">{{ tip }}</li>
        </ul>

        <h3 style="margin: 0 0 8px">分日任务</h3>
        <ul style="margin: 0; padding: 0; max-height: 420px; overflow: auto">
          <li v-for="item in aiStore.plan.tasks" :key="item.day" class="list-item-card">
            <div class="section-header" style="margin: 0 0 6px">
              <strong>Day {{ item.day }} · {{ item.focus }}</strong>
              <span class="tag-chip">{{ item.minutes }} 分钟</span>
            </div>
            <p class="muted" style="margin: 0">{{ item.deliverable }}</p>
          </li>
        </ul>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useAiStore } from "@/stores/ai";

const aiStore = useAiStore();

const form = reactive({
  goalTitle: "雅思 7.0 冲刺",
  periodDays: 14,
  dailyMinutes: 90,
  level: "intermediate" as "beginner" | "intermediate" | "advanced"
});

async function generate() {
  aiStore.loading = true;
  aiStore.errorMessage = "";
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:3000/api/ai/plans/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    
    if (data.code === 2000) {
      aiStore.plan = data.data;
    } else {
      aiStore.errorMessage = data.message || "生成失败";
    }
  } catch (error) {
    console.error("生成错误:", error);
    aiStore.errorMessage = "生成计划失败，请稍后重试";
  } finally {
    aiStore.loading = false;
  }
}
</script>