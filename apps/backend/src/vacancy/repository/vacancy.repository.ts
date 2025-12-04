import { CreateVacancyDto } from "../dto/create-vacancy.dto";
import { UpdateVacancyDto } from "../dto/update-vacancy.dto";

export interface VacancyRepository {
  create(companyId: number, data: CreateVacancyDto): Promise<any>;
  update(id: number, companyId: number, data: UpdateVacancyDto): Promise<any>;
  delete(id: number, companyId: number): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: number): Promise<any | null>;
  findByCompany(companyId: number): Promise<any[]>;
}

export const VACANCY_REPOSITORY = Symbol('VacancyRepository');
