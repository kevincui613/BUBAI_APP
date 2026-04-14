import { http } from "./http";
import { aiMockApi } from "@/mock/modules/ai-mock";
import type { AiPlanInput, AiPlanResult, ApiResponse } from "@/types";

const useAiMockApi = (import.meta.env.VITE_USE_AI_MOCK || "false") === "true";

export async function generateAiPlan(payload: AiPlanInput) {
  if (useAiMockApi) {
    return aiMockApi.generatePlan(payload);
  }
  const { data } = await http.post<ApiResponse<AiPlanResult>>("/ai/plans/generate", payload);
  return data.data;
}
