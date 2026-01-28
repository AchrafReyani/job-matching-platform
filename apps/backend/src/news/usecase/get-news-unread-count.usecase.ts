import { Injectable, Inject } from '@nestjs/common';
import { NewsRepository, NEWS_REPOSITORY } from '../repository/news.repository';

@Injectable()
export class GetNewsUnreadCountUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: NewsRepository,
  ) {}

  async execute(
    userId: string,
    userRole: 'JOB_SEEKER' | 'COMPANY',
  ): Promise<{ count: number }> {
    const count = await this.newsRepository.getUnreadCount(userId, userRole);
    return { count };
  }
}
