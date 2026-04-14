<template>
  <section class="card" style="max-width: 760px; margin: 40px auto; text-align: center">
    <h2 class="card-title" style="font-size: 34px; margin-bottom: 8px">404</h2>
    <p class="muted">页面不存在，可能已经移动或链接错误。</p>
    <div style="display: flex; justify-content: center; gap: 10px; margin-top: 14px; flex-wrap: wrap">
      <RouterLink class="button-secondary" to="/dashboard">返回概览</RouterLink>
      <RouterLink class="button-secondary" to="/goals">去目标管理</RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
