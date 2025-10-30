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

  @Get('details/:id')
  getApplicationById(@Param('id') id: string) {
    const parsedId = Number(id);
    if (isNaN(parsedId)) throw new NotFoundException('Invalid application ID');
    return this.applicationsService.getApplicationById(parsedId);
}


  // ---------------- JOB SEEKER ROUTES ----------------

  // Apply to a vacancy
  @UseGuards(JwtAuthGuard)
  @Post()
  async apply(@Request() req, @Body() dto: CreateApplicationDto) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new NotFoundException('Only job seekers can apply');
    }
    const userId = req.user.userId || req.user.sub;
    return this.applicationsService.createApplication(userId, dto);
  }

  // List all applications for logged-in job seeker
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyApplications(@Request() req) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new NotFoundException('Only job seekers can view their applications');
    }
    const userId = req.user.userId || req.user.sub;
    return this.applicationsService.getApplicationsForJobSeeker(userId);
  }

  // ---------------- COMPANY ROUTES ----------------

  // List all applications for company vacancies
  @UseGuards(JwtAuthGuard)
  @Get('company')
  async getApplicationsForCompany(@Request() req) {
    if (req.user.role !== 'COMPANY') {
      throw new NotFoundException('Only companies can view applications');
    }
    const userId = req.user.userId || req.user.sub; // Fix here
    return this.applicationsService.getApplicationsForCompany(userId);
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

    const userId = req.user.userId || req.user.sub;
    return this.applicationsService.updateApplication(
      userId,
      parseInt(id, 10),
      dto,
    );
  }
}
