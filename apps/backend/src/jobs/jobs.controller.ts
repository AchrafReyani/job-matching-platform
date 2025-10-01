import { Controller, Get, Post, Body } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() body: { title: string; description: string }) {
    return this.jobsService.createJob(body.title, body.description);
  }

  @Get()
  findAll() {
    return this.jobsService.getJobs();
  }
}
