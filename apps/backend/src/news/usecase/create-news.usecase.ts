import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NewsRepository, NEWS_REPOSITORY } from '../repository/news.repository';
import { CreateNewsDto } from '../dto';
import { News, NewsStatus } from '@prisma/client';

@Injectable()
export class CreateNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: NewsRepository,
  ) {}

  async execute(dto: CreateNewsDto): Promise<News> {
    const status = dto.status || NewsStatus.DRAFT;

    if (status === NewsStatus.SCHEDULED && !dto.scheduledAt) {
      throw new BadRequestException('Scheduled date is required for scheduled posts');
    }

    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;

    if (scheduledAt && scheduledAt <= new Date()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    const publishedAt = status === NewsStatus.PUBLISHED ? new Date() : undefined;

    return this.newsRepository.create({
      title: dto.title,
      content: dto.content,
      category: dto.category,
      audience: dto.audience || 'ALL',
      status,
      isPinned: dto.isPinned || false,
      scheduledAt,
      publishedAt,
    });
  }
}
