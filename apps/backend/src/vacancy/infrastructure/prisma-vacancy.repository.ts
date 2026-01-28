import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VacancyRepository } from '../repository/vacancy.repository';
import { CreateVacancyDto } from '../dto/create-vacancy.dto';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';

@Injectable()
export class PrismaVacancyRepository implements VacancyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: number, data: CreateVacancyDto) {
    return this.prisma.vacancy.create({
      data: {
        companyId,
        title: data.title,
        role: data.role,
        jobDescription: data.jobDescription,
        salaryRange: data.salaryRange,
      },
    });
  }

  async update(id: number, companyId: number, data: UpdateVacancyDto) {
    return this.prisma.vacancy.updateMany({
      where: { id, companyId },
      data,
    });
  }

  async delete(id: number, companyId: number) {
    return this.prisma.vacancy.delete({
      where: { id, companyId },
    });
  }

  async findAll() {
    return this.prisma.vacancy.findMany();
  }

  async findById(id: number) {
    return this.prisma.vacancy.findUnique({ where: { id } });
  }

  async findByCompany(companyId: number) {
    return this.prisma.vacancy.findMany({ where: { companyId } });
  }
}
