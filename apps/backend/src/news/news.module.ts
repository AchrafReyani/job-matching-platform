import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { NewsController } from "./controller/news.controller";
import { PrismaNewsRepository } from "./infrastructure/prisma-news.repository";
import { NEWS_REPOSITORY } from "./repository/news.repository";
import {
  CreateNewsUseCase,
  UpdateNewsUseCase,
  DeleteNewsUseCase,
  GetNewsUseCase,
  GetNewsByIdUseCase,
  GetNewsForUserUseCase,
  MarkNewsReadUseCase,
  GetNewsUnreadCountUseCase,
  PublishNewsUseCase,
  PublishScheduledNewsUseCase,
} from "./usecase";
import { NewsSchedulerService } from "./news-scheduler.service";

@Module({
  imports: [PrismaModule],
  controllers: [NewsController],
  providers: [
    {
      provide: NEWS_REPOSITORY,
      useClass: PrismaNewsRepository,
    },
    CreateNewsUseCase,
    UpdateNewsUseCase,
    DeleteNewsUseCase,
    GetNewsUseCase,
    GetNewsByIdUseCase,
    GetNewsForUserUseCase,
    MarkNewsReadUseCase,
    GetNewsUnreadCountUseCase,
    PublishNewsUseCase,
    PublishScheduledNewsUseCase,
    NewsSchedulerService,
  ],
  exports: [GetNewsUnreadCountUseCase],
})
export class NewsModule {}
