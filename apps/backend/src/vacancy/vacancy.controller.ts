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
import { VacancyService } from './vacancy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('vacancies')
export class VacancyController {
  constructor(
    private readonly vacancyService: VacancyService,
    private readonly prisma: PrismaService,
  ) {}

  // Anyone can view vacancies
  @Get()
  async getAll() {
    return this.vacancyService.getAllVacancies();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.vacancyService.getVacancyById(id);
  }

  // Only companies can create vacancies
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() data: CreateVacancyDto) {
    if (req.user.role !== 'COMPANY') {
      throw new ForbiddenException('Only companies can create vacancies');
    }

    const company = await this.prisma.company.findUnique({
      where: { userId: req.user.userId },
    });
    if (!company) throw new NotFoundException('Company not found');

    return this.vacancyService.createVacancy(company.id, data);
  }

  // Only the company who owns the vacancy can update it
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateVacancyDto,
  ) {
    if (req.user.role !== 'COMPANY') {
      throw new ForbiddenException('Only companies can edit vacancies');
    }

    const company = await this.prisma.company.findUnique({
      where: { userId: req.user.userId },
    });
    if (!company) throw new NotFoundException('Company not found');

    return this.vacancyService.updateVacancy(id, company.id, data);
  }

  // Only the company who owns the vacancy can delete it
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== 'COMPANY') {
      throw new ForbiddenException('Only companies can delete vacancies');
    }

    const company = await this.prisma.company.findUnique({
      where: { userId: req.user.userId },
    });
    if (!company) throw new NotFoundException('Company not found');

    return this.vacancyService.deleteVacancy(id, company.id);
  }
}
