import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { GetAdminStatsUseCase } from '../usecase/get-admin-stats.usecase';
import {
  GetUsersUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  DeleteAllJobSeekersUseCase,
  DeleteAllCompaniesUseCase,
} from '../usecase/user-management.usecase';
import {
  GetVacanciesUseCase,
  GetVacancyByIdUseCase,
  UpdateVacancyUseCase,
  DeleteVacancyUseCase,
  DeleteAllVacanciesUseCase,
} from '../usecase/vacancy-management.usecase';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';
import {
  AuthenticatedRequest,
  getUserId,
} from '../../common/interfaces/authenticated-request.interface';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly getAdminStatsUseCase: GetAdminStatsUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly deleteAllJobSeekersUseCase: DeleteAllJobSeekersUseCase,
    private readonly deleteAllCompaniesUseCase: DeleteAllCompaniesUseCase,
    private readonly getVacanciesUseCase: GetVacanciesUseCase,
    private readonly getVacancyByIdUseCase: GetVacancyByIdUseCase,
    private readonly updateVacancyUseCase: UpdateVacancyUseCase,
    private readonly deleteVacancyUseCase: DeleteVacancyUseCase,
    private readonly deleteAllVacanciesUseCase: DeleteAllVacanciesUseCase,
  ) {}

  // ==================== Dashboard Stats ====================

  @Get('stats')
  async getStats() {
    return this.getAdminStatsUseCase.execute();
  }

  // ==================== User Management ====================

  @Get('users')
  async getUsers(
    @Query('role') role?: 'JOB_SEEKER' | 'COMPANY',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'email' | 'name',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.getUsersUseCase.execute({
      role,
      search,
      sortBy,
      sortOrder,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.getUserByIdUseCase.execute(id);
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    await this.updateUserUseCase.execute(id, dto);
    return { message: 'User updated successfully' };
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.deleteUserUseCase.execute(id, getUserId(req));
    return { message: 'User deleted successfully' };
  }

  @Delete('users/bulk/job-seekers')
  async deleteAllJobSeekers(@Request() req: AuthenticatedRequest) {
    const count = await this.deleteAllJobSeekersUseCase.execute(getUserId(req));
    return { message: `${count} job seekers deleted successfully`, count };
  }

  @Delete('users/bulk/companies')
  async deleteAllCompanies(@Request() req: AuthenticatedRequest) {
    const count = await this.deleteAllCompaniesUseCase.execute(getUserId(req));
    return { message: `${count} companies deleted successfully`, count };
  }

  // ==================== Vacancy Management ====================

  @Get('vacancies')
  async getVacancies(
    @Query('companyId') companyId?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'title' | 'company',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.getVacanciesUseCase.execute({
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      search,
      sortBy,
      sortOrder,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('vacancies/:id')
  async getVacancyById(@Param('id', ParseIntPipe) id: number) {
    return this.getVacancyByIdUseCase.execute(id);
  }

  @Patch('vacancies/:id')
  async updateVacancy(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVacancyDto,
  ) {
    await this.updateVacancyUseCase.execute(id, dto);
    return { message: 'Vacancy updated successfully' };
  }

  @Delete('vacancies/:id')
  async deleteVacancy(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.deleteVacancyUseCase.execute(id, getUserId(req));
    return { message: 'Vacancy deleted successfully' };
  }

  @Delete('vacancies/bulk/all')
  async deleteAllVacancies(@Request() req: AuthenticatedRequest) {
    const count = await this.deleteAllVacanciesUseCase.execute(getUserId(req));
    return { message: `${count} vacancies deleted successfully`, count };
  }
}
