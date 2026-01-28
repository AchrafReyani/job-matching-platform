import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PublishScheduledNewsUseCase } from './usecase';

@Injectable()
export class NewsSchedulerService {
  constructor(
    private readonly publishScheduledNewsUseCase: PublishScheduledNewsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await this.publishScheduledNewsUseCase.execute();
  }
}
