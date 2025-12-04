import { Test, TestingModule } from '@nestjs/testing';
import { GetVacancyByIdUseCase } from './get-vacancy-by-id.usecase';
import * as vacancyRepository from '../repository/vacancy.repository';
import { NotFoundException } from '@nestjs/common';

describe('GetVacancyByIdUseCase', () => {
  let useCase: GetVacancyByIdUseCase;

  const mockRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetVacancyByIdUseCase,
        {
          provide: vacancyRepository.VACANCY_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetVacancyByIdUseCase>(GetVacancyByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the vacancy if found', async () => {
    const mockVacancy = { id: 1, title: 'Frontend Dev' };
    mockRepo.findById.mockResolvedValue(mockVacancy);

    const result = await useCase.execute(1);

    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockVacancy);
  });

  it('should throw NotFoundException if vacancy is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      new NotFoundException('Vacancy with ID 999 not found'),
    );

    expect(mockRepo.findById).toHaveBeenCalledWith(999);
  });
});
