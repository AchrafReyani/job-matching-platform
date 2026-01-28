import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { GetNotificationsDto } from "../dto/get-notifications.dto";
import { GetNotificationsUseCase } from "../usecase/get-notifications.usecase";
import { GetUnreadCountUseCase } from "../usecase/get-unread-count.usecase";
import { MarkNotificationReadUseCase } from "../usecase/mark-notification-read.usecase";
import { MarkAllNotificationsReadUseCase } from "../usecase/mark-all-notifications-read.usecase";
import {
  AuthenticatedRequest,
  getUserId,
} from "../../common/interfaces/authenticated-request.interface";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
  ) {}

  @Get()
  async getNotifications(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetNotificationsDto,
  ) {
    return this.getNotificationsUseCase.execute(
      getUserId(req),
      query.limit,
      query.offset,
    );
  }

  @Get("unread-count")
  async getUnreadCount(@Request() req: AuthenticatedRequest) {
    return this.getUnreadCountUseCase.execute(getUserId(req));
  }

  @Patch(":id/read")
  async markAsRead(
    @Request() req: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.markNotificationReadUseCase.execute(getUserId(req), id);
  }

  @Patch("read-all")
  async markAllAsRead(@Request() req: AuthenticatedRequest) {
    return this.markAllNotificationsReadUseCase.execute(getUserId(req));
  }
}
