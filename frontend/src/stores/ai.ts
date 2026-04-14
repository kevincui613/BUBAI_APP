import { defineStore } from "pinia";
import { generateAiPlan } from "@/api/ai";
import type { AiPlanInput, AiPlanResult } from "@/types";

interface AiState {
  loading: boolean;
  plan: AiPlanResult | null;
  errorMessage: string;
}

export const useAiStore = defineStore("ai", {
  state: (): AiState => ({
    loading: false,
    plan: null,
    errorMessage: ""
  }),
  actions: {
    async runPlan(payload: AiPlanInput) {
      this.loading = true;
      this.errorMessage = "";
      try {
        this.plan = await generateAiPlan(payload);
      } catch {
        this.errorMessage = "生成计划失败，请稍后重试";
      } finally {
        this.loading = false;
      }
    },
    clearPlan() {
      this.plan = null;
      this.errorMessage = "";
    }
  }
});
