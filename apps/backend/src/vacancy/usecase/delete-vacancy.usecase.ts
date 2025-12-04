import { Injectable } from '@nestjs/common';
import type { VacancyRepository } from '../repository/vacancy.repository';

@Injectable()
export class DeleteVacancyUseCase {
  constructor(private readonly vacancyRepository: VacancyRepository) {}

  async execute(id: number, companyId: number) {
    return this.vacancyRepository.delete(id, companyId);
  }
}
