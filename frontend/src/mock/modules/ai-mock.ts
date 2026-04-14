import type { AiPlanInput, AiPlanResult } from "@/types";

const focusPools = {
  beginner: ["基础理解", "概念梳理", "小练习", "复盘巩固"],
  intermediate: ["专项训练", "实战任务", "案例拆解", "复盘优化"],
  advanced: ["复杂场景", "输出作品", "性能优化", "复盘抽象"]
} as const;

function delay(ms = 220) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createTaskLabel(goalTitle: string, focus: string, day: number) {
  return `${goalTitle}：${focus}（第${day}天）`;
}

export const aiMockApi = {
  async generatePlan(input: AiPlanInput): Promise<AiPlanResult> {
    await delay();

    const days = Math.min(Math.max(input.periodDays, 3), 30);
    const focusList = focusPools[input.level];

    const tasks = Array.from({ length: days }).map((_, index) => {
      const day = index + 1;
      const focus = focusList[index % focusList.length];
      return {
        day,
        focus,
        minutes: input.dailyMinutes,
        deliverable: createTaskLabel(input.goalTitle, focus, day)
      };
    });

    const tips = [
      "每 3 天进行一次小复盘，写下卡点和改进措施",
      "优先保证任务连续性，不要追求单日超量",
      "每周至少安排 1 次输出型任务（讲解/总结/作品）"
    ];

    return {
      summary: `为你生成了 ${days} 天计划：围绕“${input.goalTitle}”，每日 ${input.dailyMinutes} 分钟，采用${
        input.level === "beginner" ? "入门渐进" : input.level === "intermediate" ? "专项强化" : "高阶冲刺"
      }节奏。`,
      tips,
      tasks
    };
  }
};
