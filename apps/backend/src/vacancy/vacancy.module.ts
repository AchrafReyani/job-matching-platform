import { Module } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { VacancyController } from './vacancy.controller';
import { PrismaModule } from '../prisma/prisma.module'; // assumes you have a PrismaModule
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, JwtModule, AuthModule],
  controllers: [VacancyController],
  providers: [VacancyService],
})
export class VacancyModule {}
