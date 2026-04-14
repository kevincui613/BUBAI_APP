<template>
  <section class="card">
    <div class="section-header">
      <h2 class="card-title">学习圈子</h2>
      <span class="badge">按目标分类入圈</span>
    </div>

    <div class="inline-actions" style="margin-bottom: 12px">
      <button
        v-for="item in categories"
        :key="item"
        class="button-secondary"
        :style="item === category ? 'border-color:#7faed4;background:#ecf7ff' : ''"
        @click="switchCategory(item)"
      >
        {{ item }}
      </button>
    </div>

    <div class="grid-2">
      <article v-for="circle in socialStore.circles" :key="circle.id" class="card">
        <div class="section-header">
          <strong>{{ circle.name }}</strong>
          <span class="tag-chip">{{ circle.category }}</span>
        </div>
        <p class="muted">{{ circle.intro }}</p>
        <p class="muted">成员数：{{ circle.memberCount }}</p>
        <button class="button-secondary" :disabled="circle.isJoined" @click="join(circle.id)">
          {{ circle.isJoined ? "已加入" : "加入圈子" }}
        </button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useSocialStore } from "@/stores/social";

const socialStore = useSocialStore();
const category = ref("all");
const categories = ["all", "英语", "算法", "产品", "数据分析"];

onMounted(() => {
  socialStore.loadCircles(category.value);
});

async function switchCategory(next: string) {
  category.value = next;
  await socialStore.loadCircles(next);
}

async function join(circleId: string) {
  await socialStore.joinAndRefresh(circleId, category.value);
}
</script>
