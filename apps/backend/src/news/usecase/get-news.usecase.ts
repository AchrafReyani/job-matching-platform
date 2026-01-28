import { Injectable, Inject } from '@nestjs/common';
import {
  NewsRepository,
  NEWS_REPOSITORY,
  PaginatedNews,
} from '../repository/news.repository';
import { NewsQueryDto } from '../dto';

@Injectable()
export class GetNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: NewsRepository,
  ) {}

  async execute(query: NewsQueryDto): Promise<PaginatedNews> {
    return this.newsRepository.findAll({
      category: query.category,
      status: query.status,
      audience: query.audience,
      page: query.page || 1,
      limit: query.limit || 10,
    });
  }
}
