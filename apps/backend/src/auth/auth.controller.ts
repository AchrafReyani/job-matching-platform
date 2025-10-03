import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/job-seeker')
  registerJobSeeker(@Body() dto: any) {
    return this.authService.registerJobSeeker(dto);
  }

  @Post('register/company')
  registerCompany(@Body() dto: any) {
    return this.authService.registerCompany(dto);
  }

  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto.email, dto.password);
  }
}