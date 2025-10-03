import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/job-seeker')
  registerJobSeeker(@Body() dto: any) { //todo add actual dto
    return this.authService.registerJobSeeker(dto);
  }

  @Post('register/company')
  registerCompany(@Body() dto: any) { //todo add actual dto
    return this.authService.registerCompany(dto);
  }

  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // { userId, role }
  }
}