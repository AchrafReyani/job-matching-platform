import { Test, TestingModule } from '@nestjs/testing';
import { GetCompanyWithVacanciesUseCase } from './get-company-with-vacancies.usecase';
import { NotFoundException } from '@nestjs/common';
import * as companyRepository from '../repository/company.repository';

describe('GetCompanyWithVacanciesUseCase', () => {
  let useCase: GetCompanyWithVacanciesUseCase;
  const mockRepo = {
    findByIdWithVacancies: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCompanyWithVacanciesUseCase,
        {
          provide: companyRepository.COMPANY_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetCompanyWithVacanciesUseCase>(
      GetCompanyWithVacanciesUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockCompanyWithVacancies = {
    id: 1,
    companyName: 'TechCorp Solutions',
    userId: 'user-1',
    websiteUrl: 'https://techcorp.com',
    description: 'A leading tech company',
    vacancies: [
      {
        id: 1,
        title: 'Senior Frontend Developer',
        salaryRange: '$120k - $150k',
        role: 'Frontend',
        jobDescription: 'We are looking for...',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 2,
        title: 'Backend Engineer',
        salaryRange: '$100k - $130k',
        role: 'Backend',
        jobDescription: 'Join our backend team...',
        createdAt: new Date('2024-01-10'),
      },
    ],
  };

  it('should return company with vacancies', async () => {
    mockRepo.findByIdWithVacancies.mockResolvedValue(mockCompanyWithVacancies);

    const result = await useCase.execute(1);

    expect(mockRepo.findByIdWithVacancies).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockCompanyWithVacancies);
    expect(result.vacancies).toHaveLength(2);
  });

  it('should throw NotFoundException if company not found', async () => {
    mockRepo.findByIdWithVacancies.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
  });

  it('should return company with empty vacancies array if no vacancies', async () => {
    const companyNoVacancies = {
      ...mockCompanyWithVacancies,
      vacancies: [],
    };
    mockRepo.findByIdWithVacancies.mockResolvedValue(companyNoVacancies);

    const result = await useCase.execute(1);

    expect(result.vacancies).toHaveLength(0);
  });
});
