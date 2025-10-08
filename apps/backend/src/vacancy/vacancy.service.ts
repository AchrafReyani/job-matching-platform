// src/vacancy/vacancy.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';

@Injectable()
export class VacancyService {
  constructor(private prisma: PrismaService) {}

  async createVacancy(companyId: number, data: CreateVacancyDto) {
    return this.prisma.vacancy.create({
      data: {
        ...data,
        companyId,
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

  async updateVacancy(id: number, companyId: number, data: UpdateVacancyDto) {
    const vacancy = await this.prisma.vacancy.findUnique({ where: { id } });
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    if (vacancy.companyId !== companyId) throw new ForbiddenException('Not allowed to edit this vacancy');

    return this.prisma.vacancy.update({
      where: { id },
      data,
    });
  }

  async deleteVacancy(id: number, companyId: number) {
    const vacancy = await this.prisma.vacancy.findUnique({ where: { id } });
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    if (vacancy.companyId !== companyId) throw new ForbiddenException('Not allowed to delete this vacancy');

    return this.prisma.vacancy.delete({ where: { id } });
  }
}
