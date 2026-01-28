import { Vacancy, Prisma } from '@prisma/client';
import { CreateVacancyDto } from '../dto/create-vacancy.dto';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';

export interface VacancyRepository {
  create(companyId: number, data: CreateVacancyDto): Promise<Vacancy>;
  update(
    id: number,
    companyId: number,
    data: UpdateVacancyDto,
  ): Promise<Prisma.BatchPayload>;
  delete(id: number, companyId: number): Promise<Vacancy>;
  findAll(): Promise<Vacancy[]>;
  findById(id: number): Promise<Vacancy | null>;
  findByCompany(companyId: number): Promise<Vacancy[]>;
}

export const VACANCY_REPOSITORY = Symbol('VacancyRepository');
