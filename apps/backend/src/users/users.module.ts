import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { USER_REPOSITORY } from './repository/user.repository';
import { CreateUserUseCase } from './usecase/create-user.usecase';
import { ValidateUserUseCase } from './usecase/validate-user.usecase';
import { FindUserByEmailUseCase } from './usecase/find-user-by-email.usecase';
import { ChangePasswordUseCase } from './usecase/change-password.usecase';
import { GetNotificationPreferencesUseCase } from './usecase/get-notification-preferences.usecase';
import { UpdateNotificationPreferencesUseCase } from './usecase/update-notification-preferences.usecase';
import { DeleteAccountUseCase } from './usecase/delete-account.usecase';
import { AccountController } from './controller/account.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute default
      },
    ]),
  ],
  controllers: [AccountController],
  providers: [
    PrismaService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CreateUserUseCase,
    ValidateUserUseCase,
    FindUserByEmailUseCase,
    ChangePasswordUseCase,
    GetNotificationPreferencesUseCase,
    UpdateNotificationPreferencesUseCase,
    DeleteAccountUseCase,
  ],
  exports: [CreateUserUseCase, ValidateUserUseCase, FindUserByEmailUseCase],
})
export class UsersModule {}
