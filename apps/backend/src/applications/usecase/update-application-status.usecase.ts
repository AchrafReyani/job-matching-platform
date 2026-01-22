import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Application, ApplicationStatus } from '@prisma/client';
import * as applicationRepository from '../repository/application.repository';

@Injectable()
export class UpdateApplicationStatusUseCase {
  constructor(
    @Inject(applicationRepository.APPLICATION_REPOSITORY)
    private readonly applicationRepository: applicationRepository.ApplicationRepository,
  ) {}

  async execute(
    userId: string,
    applicationId: number,
    status: ApplicationStatus,
  ): Promise<Application> {
    const company =
      await this.applicationRepository.findCompanyByUserId(userId);
    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    const application =
      await this.applicationRepository.findApplicationWithVacancy(applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.vacancy.companyId !== company.id) {
      throw new ForbiddenException('Not allowed to update this application');
    }

    return this.applicationRepository.updateStatus(applicationId, status);
  }
}
