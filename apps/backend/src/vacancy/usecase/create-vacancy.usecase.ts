import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Vacancy } from '@prisma/client';
import * as vacancyRepository from '../repository/vacancy.repository';
import { CreateVacancyDto } from '../dto/create-vacancy.dto';

@Injectable()
export class CreateVacancyUseCase {
  constructor(
    @Inject(vacancyRepository.VACANCY_REPOSITORY)
    private readonly vacancyRepository: vacancyRepository.VacancyRepository,
  ) {}

  async execute(companyId: number, data: CreateVacancyDto): Promise<Vacancy> {
    const { title, role, jobDescription } = data;

    if (!title || !role || !jobDescription) {
      throw new BadRequestException(
        'Missing required fields: title, role, and jobDescription are all required.',
      );
    }

    return this.vacancyRepository.create(companyId, data);
  }
}
