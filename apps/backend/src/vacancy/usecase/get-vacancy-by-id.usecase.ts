import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as vacancyRepository from '../repository/vacancy.repository';

@Injectable()
export class GetVacancyByIdUseCase {
  constructor(
    @Inject(vacancyRepository.VACANCY_REPOSITORY)
    private readonly vacancyRepository: vacancyRepository.VacancyRepository,
  ) {}

  async execute(id: number) {
    const vacancy = await this.vacancyRepository.findById(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }
    return vacancy;
  }
}
