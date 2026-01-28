import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import type {
  AdminRepository,
  UserListItem,
  UserDetails,
  PaginatedResult,
  UserFilter,
} from "../repository/admin.repository";
import { ADMIN_REPOSITORY } from "../repository/admin.repository";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(filter: UserFilter): Promise<PaginatedResult<UserListItem>> {
    return this.adminRepository.getUsers(filter);
  }
}

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(id: string): Promise<UserDetails> {
    const user = await this.adminRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<void> {
    const user = await this.adminRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role === "ADMIN") {
      throw new BadRequestException("Cannot modify admin user");
    }

    await this.adminRepository.updateUser(id, dto);
  }
}

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(id: string, adminUserId: string): Promise<void> {
    const user = await this.adminRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role === "ADMIN") {
      throw new BadRequestException("Cannot delete admin user");
    }

    if (id === adminUserId) {
      throw new BadRequestException("Cannot delete yourself");
    }

    await this.adminRepository.deleteUser(id, adminUserId);
  }
}

@Injectable()
export class DeleteAllJobSeekersUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(adminUserId: string): Promise<number> {
    return this.adminRepository.deleteAllJobSeekers(adminUserId);
  }
}

@Injectable()
export class DeleteAllCompaniesUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(adminUserId: string): Promise<number> {
    return this.adminRepository.deleteAllCompanies(adminUserId);
  }
}
