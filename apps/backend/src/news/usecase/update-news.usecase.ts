import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NewsRepository, NEWS_REPOSITORY } from '../repository/news.repository';
import { UpdateNewsDto } from '../dto';
import { News, NewsStatus } from '@prisma/client';

@Injectable()
export class UpdateNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: NewsRepository,
  ) {}

  async execute(id: number, dto: UpdateNewsDto): Promise<News> {
    const existing = await this.newsRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('News not found');
    }

    const updateData: Partial<News> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.audience !== undefined) updateData.audience = dto.audience;
    if (dto.isPinned !== undefined) updateData.isPinned = dto.isPinned;

    if (dto.status !== undefined) {
      updateData.status = dto.status;

      if (dto.status === NewsStatus.PUBLISHED && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }

      if (dto.status === NewsStatus.SCHEDULED) {
        if (!dto.scheduledAt && !existing.scheduledAt) {
          throw new BadRequestException(
            'Scheduled date is required for scheduled posts',
          );
        }
      }
    }

    if (dto.scheduledAt !== undefined) {
      const scheduledAt = new Date(dto.scheduledAt);
      if (scheduledAt <= new Date()) {
        throw new BadRequestException('Scheduled date must be in the future');
      }
      updateData.scheduledAt = scheduledAt;
    }

    return this.newsRepository.update(id, updateData);
  }
}
