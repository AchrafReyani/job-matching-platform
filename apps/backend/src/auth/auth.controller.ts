import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterJobSeekerDto } from './dto/register-jobseeker.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { UpdateJobSeekerDto } from './dto/update-jobseeker.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/job-seeker')
  registerJobSeeker(@Body() dto: RegisterJobSeekerDto) {
    return this.authService.registerJobSeeker(dto);
  }

  @Post('register/company')
  registerCompany(@Body() dto: RegisterCompanyDto) {
    return this.authService.registerCompany(dto);
  }

  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.authService.getProfile(req.user.sub, req.user.role);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async editProfile(
    @Request() req,
    @Body() dto: UpdateJobSeekerDto | UpdateCompanyDto,
  ) {
    return this.authService.editProfile(req.user.sub, req.user.role, dto);
  }
}
