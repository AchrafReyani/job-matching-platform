import { Test, TestingModule } from '@nestjs/testing';
import { GetCompanyByIdUseCase } from './get-company-by-id.usecase';
import { NotFoundException } from '@nestjs/common';
import * as companyRepository from '../repository/company.repository';

describe('GetCompanyByIdUseCase', () => {
  let useCase: GetCompanyByIdUseCase;
  const mockRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCompanyByIdUseCase,
        {
          provide: companyRepository.COMPANY_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetCompanyByIdUseCase>(GetCompanyByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return company by id', async () => {
    const company = { id: 1, companyName: 'Acme Corp', userId: 'user-1' };
    mockRepo.findById.mockResolvedValue(company);

    const result = await useCase.execute(1);

    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(company);
  });

  it('should throw NotFoundException if company not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
  });
});
