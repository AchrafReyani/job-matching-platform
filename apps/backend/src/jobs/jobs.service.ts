import { Injectable } from '@nestjs/common';
import { PrismaClient, Job } from '@prisma/client';

@Injectable()
export class JobsService {
  private prisma = new PrismaClient();

  async createJob(title: string, description: string): Promise<Job> {
    return this.prisma.job.create({ data: { title, description } });
  }

  async getJobs(): Promise<Job[]> {
    return this.prisma.job.findMany();
  }
}
