<template>
  <section class="card auth-card" style="max-width: 560px; margin: 24px auto">
    <div class="section-header">
      <h2 class="card-title" style="margin: 0">登录</h2>
      <span class="badge">V1 前端演示</span>
    </div>

    <p class="muted" style="margin-top: 0">输入账号即可进入学习仪表盘，查看打卡连续性和本周完成率。</p>

    <form class="form" @submit.prevent="submit">
      <input v-model.trim="form.email" placeholder="邮箱" type="email" required />
      <input v-model="form.password" placeholder="密码" type="password" required />
      <p class="error" v-if="errorMsg">{{ errorMsg }}</p>
      <button class="button-primary" :disabled="loading">{{ loading ? "登录中..." : "登录" }}</button>
      <button type="button" class="button-secondary" :disabled="loading" @click="fillDemo">
        一键填入演示账号
      </button>
    </form>

    <div class="card" style="margin-top: 12px">
      <p class="muted" style="margin: 0 0 6px">内置演示账号</p>
      <strong>demo@study.local</strong>
      <span> / </span>
      <strong>123456</strong>
    </div>

    <p class="muted">没有账号？<RouterLink to="/register">去注册</RouterLink></p>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const errorMsg = ref("");
const form = reactive({
  email: "",
  password: ""
});

function fillDemo() {
  form.email = "demo@study.local";
  form.password = "123456";
}

async function submit() {
  loading.value = true;
  errorMsg.value = "";
  try {
    await authStore.login(form);
    router.push("/dashboard");
  } catch (error) {
    errorMsg.value = "登录失败，请检查账号密码";
  } finally {
    loading.value = false;
  }
}
</script>
