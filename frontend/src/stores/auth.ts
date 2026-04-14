import { defineStore } from "pinia";
import { getMe, login, register } from "@/api/auth";
import type { User } from "@/types";

interface AuthState {
  accessToken: string;
  user: User | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: localStorage.getItem("accessToken") || "",
    user: null
  }),
  actions: {
    async register(payload: { email: string; password: string; nickname: string }) {
      const res = await register(payload);
      this.accessToken = res.accessToken;  // ✅ 修改这里
      this.user = res.user;
      localStorage.setItem("accessToken", this.accessToken);
      localStorage.setItem("userNickname", res.user.nickname);
    },
    async login(payload: { email: string; password: string }) {
      const res = await login(payload);
      this.accessToken = res.accessToken;  // ✅ 修改这里
      this.user = res.user;
      localStorage.setItem("accessToken", this.accessToken);
      localStorage.setItem("userNickname", res.user.nickname);
    },
    async loadMe() {
      if (!this.accessToken) return;
      try {
        this.user = await getMe();
        if (this.user?.nickname) {
          localStorage.setItem("userNickname", this.user.nickname);
        }
      } catch {
        this.logout();
      }
    },
    logout() {
      this.accessToken = "";
      this.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userNickname");
    }
  }
});