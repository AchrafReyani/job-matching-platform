import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { GetCompanyByIdUseCase } from '../usecase/get-company-by-id.usecase';
import { GetAllCompaniesUseCase } from '../usecase/get-all-companies.usecase';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  const mockGetCompanyByIdUseCase = { execute: jest.fn() };
  const mockGetAllCompaniesUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        { provide: GetCompanyByIdUseCase, useValue: mockGetCompanyByIdUseCase },
        {
          provide: GetAllCompaniesUseCase,
          useValue: mockGetAllCompaniesUseCase,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompany', () => {
    it('should return company by id', async () => {
      const mockCompany = { id: 1, companyName: 'Acme Corp', userId: 'user-1' };
      mockGetCompanyByIdUseCase.execute.mockResolvedValue(mockCompany);

      const result = await controller.getCompany(1);

      expect(mockGetCompanyByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCompany);
    });
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      const mockCompanies = [
        { id: 1, companyName: 'Acme Corp' },
        { id: 2, companyName: 'Tech Inc' },
      ];
      mockGetAllCompaniesUseCase.execute.mockResolvedValue(mockCompanies);

      const result = await controller.getAllCompanies();

      expect(mockGetAllCompaniesUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCompanies);
    });
  });
});
