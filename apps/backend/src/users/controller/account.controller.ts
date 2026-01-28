import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { DeleteAccountDto } from '../dto/delete-account.dto';
import type { NotificationPreferences } from '../dto/update-notification-preferences.dto';
import { ChangePasswordUseCase } from '../usecase/change-password.usecase';
import { GetNotificationPreferencesUseCase } from '../usecase/get-notification-preferences.usecase';
import { UpdateNotificationPreferencesUseCase } from '../usecase/update-notification-preferences.usecase';
import { DeleteAccountUseCase } from '../usecase/delete-account.usecase';
import {
  AuthenticatedRequest,
  getUserId,
} from '../../common/interfaces/authenticated-request.interface';

@Controller('users/me')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class AccountController {
  constructor(
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly getNotificationPreferencesUseCase: GetNotificationPreferencesUseCase,
    private readonly updateNotificationPreferencesUseCase: UpdateNotificationPreferencesUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
  ) {}

  @Patch('password')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.changePasswordUseCase.execute({
      userId: getUserId(req),
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  }

  @Get('notification-preferences')
  async getNotificationPreferences(
    @Request() req: AuthenticatedRequest,
  ): Promise<NotificationPreferences> {
    return this.getNotificationPreferencesUseCase.execute(getUserId(req));
  }

  @Patch('notification-preferences')
  async updateNotificationPreferences(
    @Request() req: AuthenticatedRequest,
    @Body() dto: NotificationPreferences,
  ): Promise<NotificationPreferences> {
    return this.updateNotificationPreferencesUseCase.execute(getUserId(req), dto);
  }

  @Post('delete')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @Request() req: AuthenticatedRequest,
    @Body() dto: DeleteAccountDto,
  ): Promise<void> {
    await this.deleteAccountUseCase.execute({
      userId: getUserId(req),
      password: dto.password,
      confirmation: dto.confirmation,
    });
  }
}
