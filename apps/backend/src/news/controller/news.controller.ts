import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import {
  AuthenticatedRequest,
  getUserId,
} from "../../common/interfaces/authenticated-request.interface";
import { CreateNewsDto, UpdateNewsDto, NewsQueryDto } from "../dto";
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
} from "../usecase";

@Controller("news")
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(
    private readonly createNewsUseCase: CreateNewsUseCase,
    private readonly updateNewsUseCase: UpdateNewsUseCase,
    private readonly deleteNewsUseCase: DeleteNewsUseCase,
    private readonly getNewsUseCase: GetNewsUseCase,
    private readonly getNewsByIdUseCase: GetNewsByIdUseCase,
    private readonly getNewsForUserUseCase: GetNewsForUserUseCase,
    private readonly markNewsReadUseCase: MarkNewsReadUseCase,
    private readonly getNewsUnreadCountUseCase: GetNewsUnreadCountUseCase,
    private readonly publishNewsUseCase: PublishNewsUseCase,
  ) {}

  // ========== Admin Endpoints ==========

  @Get("admin")
  async getNewsAdmin(
    @Request() req: AuthenticatedRequest,
    @Query() query: NewsQueryDto,
  ) {
    this.requireAdmin(req);
    return this.getNewsUseCase.execute(query);
  }

  @Get("admin/:id")
  async getNewsByIdAdmin(
    @Request() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
  ) {
    this.requireAdmin(req);
    return this.getNewsByIdUseCase.execute(id);
  }

  @Post()
  async createNews(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateNewsDto,
  ) {
    this.requireAdmin(req);
    return this.createNewsUseCase.execute(dto);
  }

  @Patch(":id")
  async updateNews(
    @Request() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateNewsDto,
  ) {
    this.requireAdmin(req);
    return this.updateNewsUseCase.execute(id, dto);
  }

  @Delete(":id")
  async deleteNews(
    @Request() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
  ) {
    this.requireAdmin(req);
    return this.deleteNewsUseCase.execute(id);
  }

  @Post(":id/publish")
  async publishNews(
    @Request() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
  ) {
    this.requireAdmin(req);
    return this.publishNewsUseCase.execute(id);
  }

  // ========== User Endpoints ==========

  @Get()
  async getNewsForUser(
    @Request() req: AuthenticatedRequest,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    this.requireUserRole(req);
    const userId = getUserId(req);
    const userRole = req.user.role as "JOB_SEEKER" | "COMPANY";
    return this.getNewsForUserUseCase.execute(
      userId,
      userRole,
      page || 1,
      limit || 10,
    );
  }

  @Get("unread-count")
  async getUnreadCount(@Request() req: AuthenticatedRequest) {
    this.requireUserRole(req);
    const userId = getUserId(req);
    const userRole = req.user.role as "JOB_SEEKER" | "COMPANY";
    return this.getNewsUnreadCountUseCase.execute(userId, userRole);
  }

  @Get(":id")
  async getNewsById(
    @Request() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
  ) {
    this.requireUserRole(req);
    return this.getNewsByIdUseCase.execute(id);
  }

  @Post(":id/read")
  async markAsRead(
    @Request() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
  ) {
    this.requireUserRole(req);
    const userId = getUserId(req);
    const userRole = req.user.role as "JOB_SEEKER" | "COMPANY";
    await this.markNewsReadUseCase.execute(id, userId, userRole);
    return { success: true };
  }

  // ========== Helpers ==========

  private requireAdmin(req: AuthenticatedRequest): void {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Admin access required");
    }
  }

  private requireUserRole(req: AuthenticatedRequest): void {
    if (req.user.role !== "JOB_SEEKER" && req.user.role !== "COMPANY") {
      throw new ForbiddenException("User access required");
    }
  }
}
