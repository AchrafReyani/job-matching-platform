import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import * as applicationRepository from "../repository/application.repository";

@Injectable()
export class GetApplicationByIdUseCase {
  constructor(
    @Inject(applicationRepository.APPLICATION_REPOSITORY)
    private readonly applicationRepository: applicationRepository.ApplicationRepository,
  ) {}

  async execute(
    applicationId: number,
    requesterUserId: string,
  ): Promise<applicationRepository.ApplicationWithRelations> {
    if (!applicationId || isNaN(applicationId)) {
      throw new NotFoundException("Invalid application ID");
    }

    const application =
      await this.applicationRepository.findByIdWithRelations(applicationId);

    if (!application) {
      throw new NotFoundException("Application not found");
    }

    const isJobSeeker = application.jobSeeker.userId === requesterUserId;
    const isCompany = application.vacancy.company.userId === requesterUserId;

    if (!isJobSeeker && !isCompany) {
      throw new ForbiddenException(
        "You are not allowed to view this application",
      );
    }

    return application;
  }
}
