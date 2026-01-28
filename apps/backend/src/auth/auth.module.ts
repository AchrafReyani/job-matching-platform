import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./controller/auth.controller";
import { PrismaAuthRepository } from "./infrastructure/prisma-auth.repository";
import { PrismaService } from "../prisma/prisma.service";
import { AUTH_REPOSITORY } from "./repository/auth.repository";
import { LoginUseCase } from "./usecase/login.usecase";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dev_secret",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
    LoginUseCase,
    JwtStrategy,
  ],
})
export class AuthModule {}
