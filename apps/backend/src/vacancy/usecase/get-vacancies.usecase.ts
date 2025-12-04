import { Injectable } from '@nestjs/common';
import type { VacancyRepository } from '../repository/vacancy.repository';

@Injectable()
export class GetVacanciesUseCase {
  constructor(private readonly vacancyRepository: VacancyRepository) {}

  async execute() {
    return this.vacancyRepository.findAll();
  }
}
