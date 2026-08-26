import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controller/auth.controller';
import { LineAuthController } from './controller/line-auth.controller';
import { PrismaAuthRepository } from './infrastructure/prisma-auth.repository';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_REPOSITORY } from './repository/auth.repository';
import { LoginUseCase } from './usecase/login.usecase';
import { LineLoginUseCase } from './usecase/line-login.usecase';
import { LineOidcService } from './line/line-oidc.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, LineAuthController],
  providers: [
    PrismaService,
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
    LoginUseCase,
    LineLoginUseCase,
    LineOidcService,
    JwtStrategy,
  ],
})
export class AuthModule {}
