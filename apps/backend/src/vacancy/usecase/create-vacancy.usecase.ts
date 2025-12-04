import { Injectable, BadRequestException } from '@nestjs/common';
import type { VacancyRepository } from '../repository/vacancy.repository';
import { CreateVacancyDto } from '../dto/create-vacancy.dto';

@Injectable()
export class CreateVacancyUseCase {
  constructor(private readonly vacancyRepository: VacancyRepository) {}

  async execute(companyId: number, data: CreateVacancyDto) {
    const { title, role, jobDescription } = data;

    if (!title || !role || !jobDescription) {
      throw new BadRequestException(
        'Missing required fields: title, role, and jobDescription are all required.',
      );
    }

    return this.vacancyRepository.create(companyId, data);
  }
}
