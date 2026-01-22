import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RegisterJobSeekerDto } from '../dto/register-jobseeker.dto';
import { RegisterCompanyDto } from '../dto/register-company.dto';
import { UpdateJobSeekerDto } from '../dto/update-jobseeker.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { RegisterJobSeekerUseCase } from '../usecase/register-jobseeker.usecase';
import { RegisterCompanyUseCase } from '../usecase/register-company.usecase';
import { GetProfileUseCase } from '../usecase/get-profile.usecase';
import { UpdateProfileUseCase } from '../usecase/update-profile.usecase';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

@Controller('auth')
export class UserManagementController {
  constructor(
    private readonly registerJobSeekerUseCase: RegisterJobSeekerUseCase,
    private readonly registerCompanyUseCase: RegisterCompanyUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Post('register/job-seeker')
  registerJobSeeker(@Body() dto: RegisterJobSeekerDto) {
    return this.registerJobSeekerUseCase.execute(dto);
  }

  @Post('register/company')
  registerCompany(@Body() dto: RegisterCompanyDto) {
    return this.registerCompanyUseCase.execute(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.getProfileUseCase.execute(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async editProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateJobSeekerDto | UpdateCompanyDto,
  ) {
    return this.updateProfileUseCase.execute(
      req.user.userId,
      req.user.role,
      dto,
    );
  }
}
