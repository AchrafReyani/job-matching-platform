import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NewsRepository, NEWS_REPOSITORY } from '../repository/news.repository';
import { News, NewsStatus } from '@prisma/client';

@Injectable()
export class PublishNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: NewsRepository,
  ) {}

  async execute(id: number): Promise<News> {
    const news = await this.newsRepository.findById(id);

    if (!news) {
      throw new NotFoundException('News not found');
    }

    if (news.status === NewsStatus.PUBLISHED) {
      throw new BadRequestException('News is already published');
    }

    return this.newsRepository.update(id, {
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
      scheduledAt: null,
    });
  }
}
