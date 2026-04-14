import { Body, Controller, Post } from '@nestjs/common';
import { ok } from '../common/api-response';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('plans/generate')
  async generatePlan(@Body() dto: GeneratePlanDto) {
    const result = await this.aiService.generatePlan(dto);
    return ok(result);
  }
}
