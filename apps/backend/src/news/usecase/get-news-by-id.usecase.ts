import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { NewsRepository, NEWS_REPOSITORY } from "../repository/news.repository";
import { News } from "@prisma/client";

@Injectable()
export class GetNewsByIdUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: NewsRepository,
  ) {}

  async execute(id: number): Promise<News> {
    const news = await this.newsRepository.findById(id);

    if (!news) {
      throw new NotFoundException("News not found");
    }

    return news;
  }
}
