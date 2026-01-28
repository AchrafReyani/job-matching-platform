import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateVacancyDto } from '../dto/create-vacancy.dto';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';

import { CreateVacancyUseCase } from '../usecase/create-vacancy.usecase';
import { UpdateVacancyUseCase } from '../usecase/update-vacancy.usecase';
import { DeleteVacancyUseCase } from '../usecase/delete-vacancy.usecase';
import { GetVacanciesUseCase } from '../usecase/get-vacancies.usecase';
import { GetVacancyByIdUseCase } from '../usecase/get-vacancy-by-id.usecase';
import { GetVacanciesByCompanyUseCase } from '../usecase/get-vacancies-by-company.usecase';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthenticatedRequest,
  getUserId,
} from '../../common/interfaces/authenticated-request.interface';

@Controller('vacancies')
export class VacancyController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createVacancyUseCase: CreateVacancyUseCase,
    private readonly updateVacancyUseCase: UpdateVacancyUseCase,
    private readonly deleteVacancyUseCase: DeleteVacancyUseCase,
    private readonly getVacanciesUseCase: GetVacanciesUseCase,
    private readonly getVacancyByIdUseCase: GetVacancyByIdUseCase,
    private readonly getVacanciesByCompanyUseCase: GetVacanciesByCompanyUseCase,
  ) {}

  @Get()
  async getAll() {
    return this.getVacanciesUseCase.execute();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.getVacancyByIdUseCase.execute(id);
  }

  @Get('company/:companyId')
  async getByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.getVacanciesByCompanyUseCase.execute(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateVacancyDto,
  ) {
    if (req.user.role !== 'COMPANY') {
      throw new ForbiddenException('Only companies can create vacancies');
    }

    const company = await this.prisma.company.findUnique({
      where: { userId: getUserId(req) },
    });
    if (!company) throw new NotFoundException('Company not found');

    return this.createVacancyUseCase.execute(company.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateVacancyDto,
  ) {
    if (req.user.role !== 'COMPANY') {
      throw new ForbiddenException('Only companies can edit vacancies');
    }

    const company = await this.prisma.company.findUnique({
      where: { userId: getUserId(req) },
    });
    if (!company) throw new NotFoundException('Company not found');

    return this.updateVacancyUseCase.execute(id, company.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (req.user.role !== 'COMPANY') {
      throw new ForbiddenException('Only companies can delete vacancies');
    }

    const company = await this.prisma.company.findUnique({
      where: { userId: getUserId(req) },
    });
    if (!company) throw new NotFoundException('Company not found');

    return this.deleteVacancyUseCase.execute(id, company.id);
  }
}
