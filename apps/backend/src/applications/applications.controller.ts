import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application-status.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // ---------------- JOB SEEKER ROUTES ----------------

  // Apply to a vacancy
  @UseGuards(JwtAuthGuard)
  @Post()
  async apply(@Request() req, @Body() dto: CreateApplicationDto) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new NotFoundException('Only job seekers can apply');
    }
    return this.applicationsService.createApplication(req.user.userId, dto);
  }

  // List all applications for logged-in job seeker
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyApplications(@Request() req) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new NotFoundException('Only job seekers can view their applications');
    }
    return this.applicationsService.getApplicationsForJobSeeker(req.user.userId);
  }

  // ---------------- COMPANY ROUTES ----------------

  // List all applications for company vacancies
  @UseGuards(JwtAuthGuard)
  @Get('company')
  async getApplicationsForCompany(@Request() req) {
    if (req.user.role !== 'COMPANY') {
      throw new NotFoundException('Only companies can view applications');
    }
    return this.applicationsService.getApplicationsForCompany(req.user.userId);
  }

  // Update status of an application
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateApplication(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    if (req.user.role !== 'COMPANY') {
      throw new NotFoundException('Only companies can update applications');
    }

    return this.applicationsService.updateApplication(
      req.user.userId,
      parseInt(id, 10),
      dto,
    );
  }
}
