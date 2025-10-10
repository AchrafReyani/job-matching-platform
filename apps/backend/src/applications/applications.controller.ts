import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application-status.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateApplicationDto) {
    if (req.user.role !== 'JOB_SEEKER') throw new Error('Only job seekers can apply');
    return this.applicationsService.createApplication(parseInt(req.user.userId), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('job-seeker')
  async getForJobSeeker(@Request() req) {
    if (req.user.role !== 'JOB_SEEKER') throw new Error('Only job seekers allowed');
    return this.applicationsService.getApplicationsForJobSeeker(parseInt(req.user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('company')
  async getForCompany(@Request() req) {
    if (req.user.role !== 'COMPANY') throw new Error('Only companies allowed');
    return this.applicationsService.getApplicationsForCompany(parseInt(req.user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    if (req.user.role !== 'COMPANY') throw new Error('Only companies can update applications');
    return this.applicationsService.updateApplication(parseInt(req.user.userId), parseInt(id), dto);
  }
}
