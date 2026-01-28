import { Injectable, Inject } from '@nestjs/common';
import type {
  AdminRepository,
  AdminStats,
} from '../repository/admin.repository';
import { ADMIN_REPOSITORY } from '../repository/admin.repository';

@Injectable()
export class GetAdminStatsUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(): Promise<AdminStats> {
    return this.adminRepository.getStats();
  }
}
