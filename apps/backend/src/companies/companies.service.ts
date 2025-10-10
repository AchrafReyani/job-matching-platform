import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  // Get a single company by ID
  async getCompanyById(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { id: true, companyName: true },
    });

    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  // Optionally: Get all companies
  async getAllCompanies() {
    return this.prisma.company.findMany({
      select: { id: true, companyName: true },
    });
  }
}
