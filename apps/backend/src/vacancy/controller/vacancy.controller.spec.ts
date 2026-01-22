/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { Request as ExpressRequest } from 'express';
import { VacancyController } from './vacancy.controller';
import { CreateVacancyUseCase } from '../usecase/create-vacancy.usecase';
import { UpdateVacancyUseCase } from '../usecase/update-vacancy.usecase';
import { DeleteVacancyUseCase } from '../usecase/delete-vacancy.usecase';
import { GetVacanciesUseCase } from '../usecase/get-vacancies.usecase';
import { GetVacancyByIdUseCase } from '../usecase/get-vacancy-by-id.usecase';
import { GetVacanciesByCompanyUseCase } from '../usecase/get-vacancies-by-company.usecase';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateVacancyDto } from '../dto/create-vacancy.dto';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';

interface AuthenticatedUser {
  userId: string;
  role: string;
}

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthenticatedUser;
}

describe('VacancyController', () => {
  let controller: VacancyController;

  // Mock PrismaService
  const mockPrismaService = {
    company: {
      findUnique: jest.fn(),
    },
  };

  // Mock use cases
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
        { provide: PrismaService, useValue: mockPrismaService },
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

  it('should call GetVacancyByIdUseCase with correct ID', async () => {
    const mockVacancy = {
      id: 1,
      title: 'Test',
      role: '',
      jobDescription: '',
      salaryRange: null,
      companyId: 1,
      createdAt: new Date(),
    };
    mockGetById.execute.mockResolvedValue(mockVacancy);
    const result = await controller.getById(1);
    expect(mockGetById.execute).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockVacancy);
  });

  it('should call GetVacanciesByCompanyUseCase with correct company ID', async () => {
    mockGetByCompany.execute.mockResolvedValue([{ id: 1 }]);
    const result = await controller.getByCompany(10);
    expect(mockGetByCompany.execute).toHaveBeenCalledWith(10);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should call CreateVacancyUseCase for a company user', async () => {
    const dto: CreateVacancyDto = {
      title: 'Test',
      role: 'Developer',
      jobDescription: 'Build stuff',
      salaryRange: '1000-2000',
    };
    mockPrismaService.company.findUnique.mockResolvedValue({ id: 5 });
    mockCreate.execute.mockResolvedValue({ id: 1, ...dto });

    const req = {
      user: { role: 'COMPANY', userId: 'abc' },
    } as AuthenticatedRequest;
    const result = await controller.create(req, dto);

    expect(mockPrismaService.company.findUnique).toHaveBeenCalledWith({
      where: { userId: 'abc' },
    });
    expect(mockCreate.execute).toHaveBeenCalledWith(5, dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should throw ForbiddenException if non-company tries to create', async () => {
    const dto: CreateVacancyDto = {
      title: '',
      role: '',
      jobDescription: '',
      salaryRange: '',
    };
    const req = {
      user: { role: 'JOB_SEEKER', userId: 'abc' },
    } as AuthenticatedRequest;

    await expect(controller.create(req, dto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should call UpdateVacancyUseCase for a company user', async () => {
    const dto: UpdateVacancyDto = {
      title: 'New',
      role: 'Dev',
      jobDescription: 'Desc',
      salaryRange: '0-0',
    };
    mockPrismaService.company.findUnique.mockResolvedValue({ id: 3 });
    mockUpdate.execute.mockResolvedValue({ count: 1 });

    const req = {
      user: { role: 'COMPANY', userId: 'abc' },
    } as AuthenticatedRequest;
    const result = await controller.update(req, 1, dto);

    expect(mockPrismaService.company.findUnique).toHaveBeenCalledWith({
      where: { userId: 'abc' },
    });
    expect(mockUpdate.execute).toHaveBeenCalledWith(1, 3, dto);
    expect(result).toEqual({ count: 1 });
  });

  it('should call DeleteVacancyUseCase for a company user', async () => {
    const mockVacancy = {
      id: 1,
      title: '',
      role: '',
      jobDescription: '',
      salaryRange: null,
      companyId: 2,
      createdAt: new Date(),
    };
    mockPrismaService.company.findUnique.mockResolvedValue({ id: 2 });
    mockDelete.execute.mockResolvedValue(mockVacancy);

    const req = {
      user: { role: 'COMPANY', userId: 'abc' },
    } as AuthenticatedRequest;
    const result = await controller.delete(req, 1);

    expect(mockPrismaService.company.findUnique).toHaveBeenCalledWith({
      where: { userId: 'abc' },
    });
    expect(mockDelete.execute).toHaveBeenCalledWith(1, 2);
    expect(result).toEqual(mockVacancy);
  });

  it('should throw NotFoundException if company not found', async () => {
    mockPrismaService.company.findUnique.mockResolvedValue(null);
    const req = {
      user: { role: 'COMPANY', userId: 'abc' },
    } as AuthenticatedRequest;
    const dto: CreateVacancyDto = {
      title: 'a',
      role: 'b',
      jobDescription: 'c',
      salaryRange: 'd',
    };

    await expect(controller.create(req, dto)).rejects.toThrow(
      NotFoundException,
    );
  });
});
