import {
  Controller,
  Get,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GetJobSeekerStatsUseCase } from '../usecase/get-job-seeker-stats.usecase';
import { GetCompanyStatsUseCase } from '../usecase/get-company-stats.usecase';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    sub?: string;
    role: string;
  };
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly getJobSeekerStatsUseCase: GetJobSeekerStatsUseCase,
    private readonly getCompanyStatsUseCase: GetCompanyStatsUseCase,
  ) {}

  @Get('stats')
  async getStats(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId || req.user.sub;
    const role = req.user.role;

    if (role === 'JOB_SEEKER') {
      return this.getJobSeekerStatsUseCase.execute(userId!);
    } else if (role === 'COMPANY') {
      return this.getCompanyStatsUseCase.execute(userId!);
    }

    throw new ForbiddenException('Invalid role for dashboard');
  }
}
