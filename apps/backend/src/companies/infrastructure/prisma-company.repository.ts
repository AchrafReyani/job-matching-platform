import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CompanyRepository,
  CompanyPublicInfo,
  CompanyWithVacancies,
} from '../repository/company.repository';
import {
  COMPANY_BASIC_SELECT,
  VACANCY_BASIC_SELECT,
} from '../../common/prisma/select-constants';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<CompanyPublicInfo | null> {
    return this.prisma.company.findUnique({
      where: { id },
      select: COMPANY_BASIC_SELECT,
    });
  }

  async findByIdWithVacancies(
    id: number,
  ): Promise<CompanyWithVacancies | null> {
    return this.prisma.company
      .findUnique({
        where: { id },
        select: {
          ...COMPANY_BASIC_SELECT,
          websiteUrl: true,
          description: true,
          Vacancy: {
            select: VACANCY_BASIC_SELECT,
            orderBy: { createdAt: 'desc' },
          },
        },
      })
      .then((company) => {
        if (!company) return null;
        return {
          ...company,
          vacancies: company.Vacancy,
        };
      });
  }

  async findAll(): Promise<CompanyPublicInfo[]> {
    return this.prisma.company.findMany({
      select: COMPANY_BASIC_SELECT,
    });
  }
}
