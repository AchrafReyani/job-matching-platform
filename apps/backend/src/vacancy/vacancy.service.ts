import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
@Injectable()
export class VacancyService {
  constructor(private readonly prisma: PrismaService) {}

  async createVacancy(companyId: number, data: CreateVacancyDto) {
    return this.prisma.vacancy.create({
      data: {
        companyId,
        title: data.title,
        role: data.role,
        salaryRange: data.salaryRange,
        jobDescription: data.jobDescription,
      },
    });
  }

  async getAllVacancies() {
    return this.prisma.vacancy.findMany({
      include: {
        company: true,
      },
    });
  }

  async getVacancyById(id: number) {
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    return vacancy;
  }

  async updateVacancy(companyId: number, id: number, data: UpdateVacancyDto) {
    const vacancy = await this.prisma.vacancy.findUnique({ where: { id } });
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    if (vacancy.companyId !== companyId)
      throw new NotFoundException('You cannot edit this vacancy');

    return this.prisma.vacancy.update({
      where: { id },
      data,
    });
  }

  async deleteVacancy(companyId: number, id: number) {
    const vacancy = await this.prisma.vacancy.findUnique({ where: { id } });
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    if (vacancy.companyId !== companyId)
      throw new NotFoundException('You cannot delete this vacancy');

    return this.prisma.vacancy.delete({ where: { id } });
  }
}
