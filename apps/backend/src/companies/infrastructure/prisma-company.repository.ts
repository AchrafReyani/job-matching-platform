import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CompanyRepository,
  CompanyPublicInfo,
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

  async findAll(): Promise<CompanyPublicInfo[]> {
    return this.prisma.company.findMany({
      select: { id: true, companyName: true, userId: true },
    });
  }
}
