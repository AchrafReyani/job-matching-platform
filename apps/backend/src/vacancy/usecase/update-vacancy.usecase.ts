import { Injectable } from '@nestjs/common';
import type { VacancyRepository } from '../repository/vacancy.repository';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';

@Injectable()
export class UpdateVacancyUseCase {
  constructor(private readonly vacancyRepository: VacancyRepository) {}

  async execute(id: number, companyId: number, data: UpdateVacancyDto) {
    return this.vacancyRepository.update(id, companyId, data);
  }
}
