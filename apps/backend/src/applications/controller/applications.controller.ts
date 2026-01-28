import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationDto } from '../dto/update-application-status.dto';
import { CreateApplicationUseCase } from '../usecase/create-application.usecase';
import { GetApplicationsForJobSeekerUseCase } from '../usecase/get-applications-for-jobseeker.usecase';
import { GetApplicationsForCompanyUseCase } from '../usecase/get-applications-for-company.usecase';
import { GetApplicationByIdUseCase } from '../usecase/get-application-by-id.usecase';
import { UpdateApplicationStatusUseCase } from '../usecase/update-application-status.usecase';
import { DeleteMatchUseCase } from '../usecase/delete-match.usecase';
import {
  AuthenticatedRequest,
  getUserId,
} from '../../common/interfaces/authenticated-request.interface';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly createApplicationUseCase: CreateApplicationUseCase,
    private readonly getApplicationsForJobSeekerUseCase: GetApplicationsForJobSeekerUseCase,
    private readonly getApplicationsForCompanyUseCase: GetApplicationsForCompanyUseCase,
    private readonly getApplicationByIdUseCase: GetApplicationByIdUseCase,
    private readonly updateApplicationStatusUseCase: UpdateApplicationStatusUseCase,
    private readonly deleteMatchUseCase: DeleteMatchUseCase,
  ) {}

  @Get('details/:id')
  @UseGuards(JwtAuthGuard)
  async getApplicationById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.getApplicationByIdUseCase.execute(id, getUserId(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async apply(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateApplicationDto,
  ) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new ForbiddenException('Only job seekers can apply');
    }
    return this.createApplicationUseCase.execute(getUserId(req), dto.vacancyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyApplications(@Request() req: AuthenticatedRequest) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new ForbiddenException(
        'Only job seekers can view their applications',
      );
    }
    return this.getApplicationsForJobSeekerUseCase.execute(getUserId(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get('company')
  async getApplicationsForCompany(@Request() req: AuthenticatedRequest) {
    if (req.user.role !== 'COMPANY') {
      throw new ForbiddenException('Only companies can view applications');
    }
    return this.getApplicationsForCompanyUseCase.execute(getUserId(req));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateApplication(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationDto,
  ) {
    if (req.user.role !== 'COMPANY') {
      throw new ForbiddenException('Only companies can update applications');
    }
    return this.updateApplicationStatusUseCase.execute(
      getUserId(req),
      id,
      dto.status as ApplicationStatus,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/match')
  async deleteMatch(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.deleteMatchUseCase.execute(getUserId(req), id);
    return { message: 'Match deleted successfully' };
  }
}
