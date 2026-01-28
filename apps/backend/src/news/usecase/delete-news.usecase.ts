import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { NewsRepository, NEWS_REPOSITORY } from "../repository/news.repository";

@Injectable()
export class DeleteNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: NewsRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.newsRepository.findById(id);

    if (!existing) {
      throw new NotFoundException("News not found");
    }

    await this.newsRepository.delete(id);
  }
}
