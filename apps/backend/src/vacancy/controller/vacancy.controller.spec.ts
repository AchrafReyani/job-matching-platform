import { Test, TestingModule } from '@nestjs/testing';
import { VacancyController } from './vacancy.controller';
import { CreateVacancyUseCase } from '../usecase/create-vacancy.usecase';
import { UpdateVacancyUseCase } from '../usecase/update-vacancy.usecase';
import { DeleteVacancyUseCase } from '../usecase/delete-vacancy.usecase';
import { GetVacanciesUseCase } from '../usecase/get-vacancies.usecase';
import { GetVacancyByIdUseCase } from '../usecase/get-vacancy-by-id.usecase';
import { GetVacanciesByCompanyUseCase } from '../usecase/get-vacancies-by-company.usecase';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateVacancyDto } from '../dto/create-vacancy.dto';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';

describe('VacancyController', () => {
  let controller: VacancyController;

  // Mocks for all use cases
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };
  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockGetByCompany = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VacancyController],
      providers: [
        { provide: CreateVacancyUseCase, useValue: mockCreate },
        { provide: UpdateVacancyUseCase, useValue: mockUpdate },
        { provide: DeleteVacancyUseCase, useValue: mockDelete },
        { provide: GetVacanciesUseCase, useValue: mockGetAll },
        { provide: GetVacancyByIdUseCase, useValue: mockGetById },
        { provide: GetVacanciesByCompanyUseCase, useValue: mockGetByCompany },
      ],
    }).compile();

    controller = module.get<VacancyController>(VacancyController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call GetVacanciesUseCase when getting all vacancies', async () => {
    mockGetAll.execute.mockResolvedValue(['vacancy1', 'vacancy2']);
    const result = await controller.getAll();
    expect(mockGetAll.execute).toHaveBeenCalled();
    expect(result).toEqual(['vacancy1', 'vacancy2']);
  });

  it('should call GetVacancyByIdUseCase with the correct ID', async () => {
    mockGetById.execute.mockResolvedValue({ id: 1, title: 'test' });
    const result = await controller.getById(1);
    expect(mockGetById.execute).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, title: 'test' });
  });

  it('should call GetVacanciesByCompanyUseCase with the correct company ID', async () => {
    mockGetByCompany.execute.mockResolvedValue(['vacancyA']);
    const result = await controller.getByCompany(5);
    expect(mockGetByCompany.execute).toHaveBeenCalledWith(5);
    expect(result).toEqual(['vacancyA']);
  });

  it('should call CreateVacancyUseCase for a company user', async () => {
    const dto: CreateVacancyDto = { title: 'dev', role: 'frontend', jobDescription: 'test' };
    mockCreate.execute.mockResolvedValue({ id: 1, ...dto });

    const req = { user: { role: 'COMPANY', companyId: 10 } };
    const result = await controller.create(req, dto);

    expect(mockCreate.execute).toHaveBeenCalledWith(10, dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should throw ForbiddenException if non-company tries to create', async () => {
    const dto: CreateVacancyDto = { title: 'dev', role: 'frontend', jobDescription: 'test' };
    const req = { user: { role: 'JOB_SEEKER' } };

    await expect(controller.create(req, dto)).rejects.toThrow(ForbiddenException);
    expect(mockCreate.execute).not.toHaveBeenCalled();
  });

  it('should call UpdateVacancyUseCase for a company user', async () => {
    const dto: UpdateVacancyDto = { title: 'updated' };
    mockUpdate.execute.mockResolvedValue({ id: 1, ...dto });

    const req = { user: { role: 'COMPANY', companyId: 10 } };
    const result = await controller.update(req, 1, dto);

    expect(mockUpdate.execute).toHaveBeenCalledWith(1, 10, dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should call DeleteVacancyUseCase for a company user', async () => {
    mockDelete.execute.mockResolvedValue({ success: true });
    const req = { user: { role: 'COMPANY', companyId: 5 } };
    const result = await controller.delete(req, 1);

    expect(mockDelete.execute).toHaveBeenCalledWith(1, 5);
    expect(result).toEqual({ success: true });
  });
});
