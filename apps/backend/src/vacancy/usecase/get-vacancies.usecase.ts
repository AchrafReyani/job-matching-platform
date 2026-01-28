import { Injectable, Inject } from "@nestjs/common";
import * as vacancyRepository from "../repository/vacancy.repository";

@Injectable()
export class GetVacanciesUseCase {
  constructor(
    @Inject(vacancyRepository.VACANCY_REPOSITORY)
    private readonly vacancyRepository: vacancyRepository.VacancyRepository,
  ) {}

  async execute() {
    return this.vacancyRepository.findAll();
  }
}
