import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { LoginUseCase } from '../usecase/login.usecase';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}
