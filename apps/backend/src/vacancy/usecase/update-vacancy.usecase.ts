import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as vacancyRepository from '../repository/vacancy.repository';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';

@Injectable()
export class UpdateVacancyUseCase {
  constructor(
    @Inject(vacancyRepository.VACANCY_REPOSITORY)
    private readonly vacancyRepository: vacancyRepository.VacancyRepository,
  ) {}

  async execute(
    id: number,
    companyId: number,
    data: UpdateVacancyDto,
  ): Promise<Prisma.BatchPayload> {
    return this.vacancyRepository.update(id, companyId, data);
  }
}
