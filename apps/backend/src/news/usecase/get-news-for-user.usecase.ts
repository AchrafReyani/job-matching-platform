import { Injectable, Inject } from "@nestjs/common";
import {
  NewsRepository,
  NEWS_REPOSITORY,
  PaginatedNews,
} from "../repository/news.repository";

@Injectable()
export class GetNewsForUserUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: NewsRepository,
  ) {}

  async execute(
    userId: string,
    userRole: "JOB_SEEKER" | "COMPANY",
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedNews> {
    return this.newsRepository.findPublishedForUser(
      userRole,
      userId,
      page,
      limit,
    );
  }
}
