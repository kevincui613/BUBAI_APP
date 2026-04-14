import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeneratePlanDto } from './dto/generate-plan.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  async generatePlan(input: GeneratePlanDto) {
    const apiKey = this.configService.get<string>('QWEN_API_KEY');
    const baseUrl =
      this.configService.get<string>('QWEN_BASE_URL') ||
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    const model = this.configService.get<string>('QWEN_MODEL') || 'qwen3.5-plus';

    if (!apiKey) {
      return this.fallbackPlan(input);
    }

    try {
      const prompt = `请为学习目标生成结构化计划。\n目标: ${input.goalTitle}\n周期: ${input.periodDays}天\n每日投入: ${input.dailyMinutes}分钟\n水平: ${input.level}\n\n请仅输出JSON，格式:\n{\"summary\":string,\"tips\":string[],\"tasks\":[{\"day\":number,\"focus\":string,\"minutes\":number,\"deliverable\":string}]}`;

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: '你是学习规划助手，请输出可执行、简明的计划。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Qwen API failed with status ${response.status}`);
        return this.fallbackPlan(input);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return this.fallbackPlan(input);
      }

      const parsed = this.safeJson(content);
      if (!parsed) {
        return this.fallbackPlan(input);
      }

      return parsed;
    } catch (error) {
      this.logger.warn('Qwen request error, fallback plan used');
      return this.fallbackPlan(input);
    }
  }

  private safeJson(text: string):
    | { summary: string; tips: string[]; tasks: Array<{ day: number; focus: string; minutes: number; deliverable: string }> }
    | null {
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        return null;
      }
      const payload = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      return payload;
    } catch {
      return null;
    }
  }

  private fallbackPlan(input: GeneratePlanDto) {
    const focusMap: Record<GeneratePlanDto['level'], string[]> = {
      beginner: ['基础理解', '概念梳理', '小练习', '复盘巩固'],
      intermediate: ['专项训练', '实战任务', '案例拆解', '复盘优化'],
      advanced: ['复杂场景', '输出作品', '性能优化', '复盘抽象'],
    };

    const focusList = focusMap[input.level];
    const tasks = Array.from({ length: input.periodDays }).map((_, index) => {
      const day = index + 1;
      const focus = focusList[index % focusList.length];
      return {
        day,
        focus,
        minutes: input.dailyMinutes,
        deliverable: `${input.goalTitle}：${focus}（第${day}天）`,
      };
    });

    return {
      summary: `已生成 ${input.periodDays} 天计划，目标“${input.goalTitle}”，每日 ${input.dailyMinutes} 分钟。`,
      tips: ['每3天复盘一次', '优先保证连续性', '每周完成一次输出任务'],
      tasks,
    };
  }
}
