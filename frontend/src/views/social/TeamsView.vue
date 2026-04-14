<template>
  <section class="grid-2">
    <article class="card">
      <div class="section-header">
        <h2 class="card-title">搭子组队</h2>
        <span class="badge">招募帖发布</span>
      </div>

      <form class="form" @submit.prevent="submitPost">
        <input v-model.trim="form.title" placeholder="标题，例如 30 天英语冲刺组" required />
        <textarea v-model.trim="form.goal" placeholder="目标描述，例如 每天精听 45 分钟" rows="3" required />
        <input v-model.number="form.headcount" type="number" min="2" max="20" placeholder="人数" required />
        <input v-model.trim="form.contact" placeholder="联系方式，例如 vx:abc123" required />
        <p class="error" v-if="errorMsg">{{ errorMsg }}</p>
        <button class="button-primary" :disabled="loading">{{ loading ? "发布中..." : "发布招募帖" }}</button>
      </form>

      <div class="soft-divider"></div>

      <h3 style="margin: 0 0 10px">组队打卡挑战</h3>
      <ul style="margin: 0; padding: 0">
        <li v-for="challenge in socialStore.teamChallenges" :key="challenge.id" class="list-item-card">
          <strong>{{ challenge.title }}</strong>
          <p class="muted" style="margin: 6px 0">{{ challenge.target }}</p>
          <p class="muted" style="margin: 0">团队进度 {{ challenge.progress }}% · 我的排名 {{ challenge.myRank }}/{{ challenge.teamSize }}</p>
          <div class="progress-track" style="margin-top: 8px">
            <div class="progress-fill" :style="{ width: `${challenge.progress}%` }"></div>
          </div>
        </li>
      </ul>
    </article>

    <article class="card">
      <div class="section-header">
        <h2 class="card-title">招募大厅</h2>
        <button class="button-secondary" @click="socialStore.loadTeams()">刷新</button>
      </div>

      <div class="empty" v-if="socialStore.teamPosts.length === 0">还没有招募帖，发布第一条吧。</div>
      <ul v-else style="margin: 0; padding: 0">
        <li v-for="post in socialStore.teamPosts" :key="post.id" class="list-item-card">
          <div class="section-header" style="margin: 0 0 6px">
            <strong>{{ post.title }}</strong>
            <span class="tag-chip">{{ post.currentCount }}/{{ post.headcount }}人</span>
          </div>
          <p class="muted" style="margin: 0 0 6px">目标：{{ post.goal }}</p>
          <p class="muted" style="margin: 0 0 8px">发起人：{{ post.createdBy }} · 联系方式：{{ post.contact }}</p>
          <button class="button-secondary">申请加入</button>
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useSocialStore } from "@/stores/social";

const socialStore = useSocialStore();
const loading = ref(false);
const errorMsg = ref("");

const form = reactive({
  title: "",
  goal: "",
  headcount: 4,
  contact: ""
});

onMounted(() => {
  socialStore.loadTeams();
});

async function submitPost() {
  if (form.headcount < 2) {
    errorMsg.value = "人数至少 2 人";
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  try {
    await socialStore.createPostAndRefresh(form);
    form.title = "";
    form.goal = "";
    form.headcount = 4;
    form.contact = "";
  } catch {
    errorMsg.value = "发布失败，请稍后重试";
  } finally {
    loading.value = false;
  }
}
</script>
