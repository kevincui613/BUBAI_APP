<template>
  <section class="card auth-card" style="max-width: 560px; margin: 24px auto">
    <h2 class="card-title">注册</h2>
    <p class="muted" style="margin-top: 0">创建账号后会自动生成你的学习空间并进入概览页。</p>

    <form class="form" @submit.prevent="submit">
      <input v-model.trim="form.nickname" placeholder="昵称" required />
      <input v-model.trim="form.email" placeholder="邮箱" type="email" required />
      <input v-model="form.password" placeholder="密码（至少 6 位）" type="password" minlength="6" required />
      <p class="error" v-if="errorMsg">{{ errorMsg }}</p>
      <button class="button-primary" :disabled="loading">{{ loading ? "注册中..." : "注册" }}</button>
    </form>

    <div class="card" style="margin-top: 12px">
      <p class="muted" style="margin: 0">注册完成后会自动登录，并进入你的学习概览页面。</p>
    </div>

    <p class="muted">已有账号？<RouterLink to="/login">去登录</RouterLink></p>
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
  nickname: "",
  email: "",
  password: ""
});

async function submit() {
  if (form.password.length < 6) {
    errorMsg.value = "密码长度至少 6 位";
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  try {
    await authStore.register(form);
    router.push("/dashboard");
  } catch (error) {
    errorMsg.value = "注册失败，请稍后重试";
  } finally {
    loading.value = false;
  }
}
</script>
