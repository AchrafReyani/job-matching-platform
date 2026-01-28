import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import type {
  AdminRepository,
  VacancyListItem,
  VacancyDetails,
  PaginatedResult,
  VacancyFilter,
} from "../repository/admin.repository";
import { ADMIN_REPOSITORY } from "../repository/admin.repository";
import { UpdateVacancyDto } from "../dto/update-vacancy.dto";

@Injectable()
export class GetVacanciesUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(
    filter: VacancyFilter,
  ): Promise<PaginatedResult<VacancyListItem>> {
    return this.adminRepository.getVacancies(filter);
  }
}

@Injectable()
export class GetVacancyByIdUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(id: number): Promise<VacancyDetails> {
    const vacancy = await this.adminRepository.getVacancyById(id);
    if (!vacancy) {
      throw new NotFoundException("Vacancy not found");
    }
    return vacancy;
  }
}

@Injectable()
export class UpdateVacancyUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(id: number, dto: UpdateVacancyDto): Promise<void> {
    const vacancy = await this.adminRepository.getVacancyById(id);
    if (!vacancy) {
      throw new NotFoundException("Vacancy not found");
    }

    await this.adminRepository.updateVacancy(id, dto);
  }
}

@Injectable()
export class DeleteVacancyUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(id: number, adminUserId: string): Promise<void> {
    const vacancy = await this.adminRepository.getVacancyById(id);
    if (!vacancy) {
      throw new NotFoundException("Vacancy not found");
    }

    await this.adminRepository.deleteVacancy(id, adminUserId);
  }
}

@Injectable()
export class DeleteAllVacanciesUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(adminUserId: string): Promise<number> {
    return this.adminRepository.deleteAllVacancies(adminUserId);
  }
}
