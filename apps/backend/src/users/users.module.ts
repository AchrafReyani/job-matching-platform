import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { USER_REPOSITORY } from './repository/user.repository';
import { CreateUserUseCase } from './usecase/create-user.usecase';
import { ValidateUserUseCase } from './usecase/validate-user.usecase';
import { FindUserByEmailUseCase } from './usecase/find-user-by-email.usecase';

@Module({
  providers: [
    PrismaService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CreateUserUseCase,
    ValidateUserUseCase,
    FindUserByEmailUseCase,
  ],
  exports: [CreateUserUseCase, ValidateUserUseCase, FindUserByEmailUseCase],
})
export class UsersModule {}
