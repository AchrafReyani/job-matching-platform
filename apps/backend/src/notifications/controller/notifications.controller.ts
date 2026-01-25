import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GetNotificationsDto } from '../dto/get-notifications.dto';
import { GetNotificationsUseCase } from '../usecase/get-notifications.usecase';
import { GetUnreadCountUseCase } from '../usecase/get-unread-count.usecase';
import { MarkNotificationReadUseCase } from '../usecase/mark-notification-read.usecase';
import { MarkAllNotificationsReadUseCase } from '../usecase/mark-all-notifications-read.usecase';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    sub?: string;
    role: string;
  };
}

@Controller('notifications')
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
    const userId = req.user.userId || req.user.sub;
    return this.getNotificationsUseCase.execute(
      userId!,
      query.limit,
      query.offset,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId || req.user.sub;
    return this.getUnreadCountUseCase.execute(userId!);
  }

  @Patch(':id/read')
  async markAsRead(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.markNotificationReadUseCase.execute(userId!, id);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId || req.user.sub;
    return this.markAllNotificationsReadUseCase.execute(userId!);
  }
}
