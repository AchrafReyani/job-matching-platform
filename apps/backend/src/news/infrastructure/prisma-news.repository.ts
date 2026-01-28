import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  NewsRepository,
  NewsFilters,
  PaginatedNews,
  NewsWithReadStatus,
} from "../repository/news.repository";
import {
  News,
  NewsRead,
  NewsCategory,
  NewsStatus,
  NewsAudience,
  Prisma,
} from "@prisma/client";

@Injectable()
export class PrismaNewsRepository implements NewsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    content: string;
    category: NewsCategory;
    audience: NewsAudience;
    status: NewsStatus;
    isPinned: boolean;
    scheduledAt?: Date;
    publishedAt?: Date;
  }): Promise<News> {
    return this.prisma.news.create({ data });
  }

  async findById(id: number): Promise<News | null> {
    return this.prisma.news.findUnique({ where: { id } });
  }

  async findAll(filters: NewsFilters): Promise<PaginatedNews> {
    const where: Prisma.NewsWhereInput = {};

    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.audience) {
      where.audience = filters.audience;
    }

    const [data, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.news.count({ where }),
    ]);

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async findPublishedForUser(
    userRole: "JOB_SEEKER" | "COMPANY",
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedNews> {
    const audienceFilter: NewsAudience[] = [
      NewsAudience.ALL,
      userRole === "JOB_SEEKER"
        ? NewsAudience.JOB_SEEKER
        : NewsAudience.COMPANY,
    ];

    const where: Prisma.NewsWhereInput = {
      status: NewsStatus.PUBLISHED,
      audience: { in: audienceFilter },
    };

    const [newsItems, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          readBy: {
            where: { userId },
            select: { id: true },
          },
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    const data: NewsWithReadStatus[] = newsItems.map((news) => ({
      ...news,
      isRead: news.readBy.length > 0,
      readBy: undefined,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: number, data: Partial<News>): Promise<News> {
    return this.prisma.news.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.news.delete({ where: { id } });
  }

  async markAsRead(newsId: number, userId: string): Promise<NewsRead> {
    return this.prisma.newsRead.upsert({
      where: {
        newsId_userId: { newsId, userId },
      },
      create: { newsId, userId },
      update: {},
    });
  }

  async isRead(newsId: number, userId: string): Promise<boolean> {
    const record = await this.prisma.newsRead.findUnique({
      where: {
        newsId_userId: { newsId, userId },
      },
    });
    return !!record;
  }

  async getUnreadCount(
    userId: string,
    userRole: "JOB_SEEKER" | "COMPANY",
  ): Promise<number> {
    const audienceFilter: NewsAudience[] = [
      NewsAudience.ALL,
      userRole === "JOB_SEEKER"
        ? NewsAudience.JOB_SEEKER
        : NewsAudience.COMPANY,
    ];

    const totalPublished = await this.prisma.news.count({
      where: {
        status: NewsStatus.PUBLISHED,
        audience: { in: audienceFilter },
      },
    });

    const readCount = await this.prisma.newsRead.count({
      where: {
        userId,
        news: {
          status: NewsStatus.PUBLISHED,
          audience: { in: audienceFilter },
        },
      },
    });

    return totalPublished - readCount;
  }

  async findScheduledToPublish(): Promise<News[]> {
    return this.prisma.news.findMany({
      where: {
        status: NewsStatus.SCHEDULED,
        scheduledAt: { lte: new Date() },
      },
    });
  }

  async publishScheduled(ids: number[]): Promise<void> {
    await this.prisma.news.updateMany({
      where: { id: { in: ids } },
      data: {
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }
}
