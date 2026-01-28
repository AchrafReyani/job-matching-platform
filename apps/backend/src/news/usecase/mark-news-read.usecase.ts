import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NewsRepository, NEWS_REPOSITORY } from '../repository/news.repository';
import { NewsStatus, NewsAudience } from '@prisma/client';

@Injectable()
export class MarkNewsReadUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: NewsRepository,
  ) {}

  async execute(
    newsId: number,
    userId: string,
    userRole: 'JOB_SEEKER' | 'COMPANY',
  ): Promise<void> {
    const news = await this.newsRepository.findById(newsId);

    if (!news) {
      throw new NotFoundException('News not found');
    }

    if (news.status !== NewsStatus.PUBLISHED) {
      throw new NotFoundException('News not found');
    }

    // Check audience permission
    if (news.audience !== NewsAudience.ALL) {
      const allowedAudience =
        userRole === 'JOB_SEEKER' ? NewsAudience.JOB_SEEKER : NewsAudience.COMPANY;
      if (news.audience !== allowedAudience) {
        throw new ForbiddenException('You do not have access to this news');
      }
    }

    await this.newsRepository.markAsRead(newsId, userId);
  }
}
