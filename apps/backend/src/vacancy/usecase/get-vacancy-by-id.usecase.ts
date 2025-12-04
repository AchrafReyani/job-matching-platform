import { Injectable, NotFoundException } from '@nestjs/common';
import type { VacancyRepository } from '../repository/vacancy.repository';

@Injectable()
export class GetVacancyByIdUseCase {
  constructor(private readonly vacancyRepository: VacancyRepository) {}

  async execute(id: number) {
    const vacancy = await this.vacancyRepository.findById(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }
    return vacancy;
  }
}
