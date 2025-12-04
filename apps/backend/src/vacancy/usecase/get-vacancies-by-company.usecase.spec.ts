import { Test, TestingModule } from '@nestjs/testing';
import { GetVacanciesByCompanyUseCase } from './get-vacancies-by-company.usecase';
import * as vacancyRepository from '../repository/vacancy.repository';

describe('GetVacanciesByCompanyUseCase', () => {
  let useCase: GetVacanciesByCompanyUseCase;

  const mockRepo = {
    findByCompany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetVacanciesByCompanyUseCase,
        {
          provide: vacancyRepository.VACANCY_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetVacanciesByCompanyUseCase>(GetVacanciesByCompanyUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call repository.findByCompany with the correct companyId', async () => {
    const mockVacancies = [{ id: 1, title: 'Frontend Dev' }];
    mockRepo.findByCompany.mockResolvedValue(mockVacancies);

    const result = await useCase.execute(123);

    expect(mockRepo.findByCompany).toHaveBeenCalledWith(123);
    expect(result).toEqual(mockVacancies);
  });
});
