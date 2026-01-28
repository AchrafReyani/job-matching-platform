import { Injectable, Inject, Logger } from "@nestjs/common";
import { NewsRepository, NEWS_REPOSITORY } from "../repository/news.repository";

@Injectable()
export class PublishScheduledNewsUseCase {
  private readonly logger = new Logger(PublishScheduledNewsUseCase.name);

  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: NewsRepository,
  ) {}

  async execute(): Promise<number> {
    const scheduledNews = await this.newsRepository.findScheduledToPublish();

    if (scheduledNews.length === 0) {
      return 0;
    }

    const ids = scheduledNews.map((n) => n.id);
    await this.newsRepository.publishScheduled(ids);

    this.logger.log(
      `Published ${ids.length} scheduled news posts: ${ids.join(", ")}`,
    );

    return ids.length;
  }
}
