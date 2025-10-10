import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';

@Injectable()
export class VacancyService {
  constructor(private readonly prisma: PrismaService) {}

  async createVacancy(companyId: number, data: CreateVacancyDto) {
    const { title, role, jobDescription, salaryRange } = data;
    if (!title || !role || !jobDescription) {
      throw new BadRequestException(
        'Missing required fields: title, role, and jobDescription are all required.'
      );
    }

    return this.prisma.vacancy.create({
      data: {
        companyId,
        title,
        role,
        jobDescription,
        salaryRange,
      },
    });
  }

  async updateVacancy(id: number, companyId: number, data: UpdateVacancyDto) {
    return this.prisma.vacancy.updateMany({
      where: { id, companyId },
      data,
    });
  }

  async deleteVacancy(id: number, companyId: number) {
    return this.prisma.vacancy.deleteMany({
      where: { id, companyId },
    });
  }

  async getAllVacancies() {
    return this.prisma.vacancy.findMany();
  }

  async getVacancyById(id: number) {
    return this.prisma.vacancy.findUnique({ where: { id } });
  }

  // New method: get vacancies by company
  async getVacanciesByCompany(companyId: number) {
    return this.prisma.vacancy.findMany({
      where: { companyId },
    });
  }
}
