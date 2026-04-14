import { defineStore } from "pinia";
import { createGoal, fetchGoals, type CreateGoalPayload } from "@/api/goals";
import type { Goal } from "@/types";

interface GoalsState {
  goals: Goal[];
  loading: boolean;
}

export const useGoalsStore = defineStore("goals", {
  state: (): GoalsState => ({
    goals: [],
    loading: false
  }),
  actions: {
    async loadGoals(status = "active") {
      this.loading = true;
      try {
        const goals = await fetchGoals(status);
        this.goals = Array.isArray(goals) ? [...goals] : [];
        console.log("加载目标完成，数量:", this.goals.length);
      } catch (error) {
        console.error("加载目标失败:", error);
        this.goals = [];
      } finally {
        this.loading = false;
      }
    },
    async addGoal(payload: CreateGoalPayload) {
      try {
        const goal = await createGoal(payload);
        if (goal) {
          this.goals = [goal, ...this.goals];
          console.log("添加目标成功:", goal);
        }
      } catch (error) {
        console.error("添加目标失败:", error);
        throw error;
      }
    }
  }
});