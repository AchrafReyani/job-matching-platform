import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CompanyRepository,
  CompanyPublicInfo,
  CompanyWithVacancies,
} from '../repository/company.repository';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<CompanyPublicInfo | null> {
    return this.prisma.company.findUnique({
      where: { id },
      select: { id: true, companyName: true, userId: true },
    });
  }

  async findByIdWithVacancies(id: number): Promise<CompanyWithVacancies | null> {
    return this.prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        userId: true,
        websiteUrl: true,
        description: true,
        Vacancy: {
          select: {
            id: true,
            title: true,
            salaryRange: true,
            role: true,
            jobDescription: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    }).then(company => {
      if (!company) return null;
      return {
        ...company,
        vacancies: company.Vacancy,
      };
    });
  }

  async findAll(): Promise<CompanyPublicInfo[]> {
    return this.prisma.company.findMany({
      select: { id: true, companyName: true, userId: true },
    });
  }
}
