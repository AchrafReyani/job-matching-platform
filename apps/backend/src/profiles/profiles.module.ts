import { Module } from '@nestjs/common';
import { ProfilesController } from './controller/profiles.controller';
import { PrismaProfileRepository } from './infrastructure/prisma-profile.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PROFILE_REPOSITORY } from './repository/profile.repository';
import { GetPublicProfileUseCase } from './usecase/get-public-profile.usecase';

@Module({
  controllers: [ProfilesController],
  providers: [
    PrismaService,
    {
      provide: PROFILE_REPOSITORY,
      useClass: PrismaProfileRepository,
    },
    GetPublicProfileUseCase,
  ],
})
export class ProfilesModule {}
