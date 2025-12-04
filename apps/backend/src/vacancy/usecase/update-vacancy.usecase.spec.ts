import { Test, TestingModule } from '@nestjs/testing';
import { UpdateVacancyUseCase } from './update-vacancy.usecase';
import * as vacancyRepository from '../repository/vacancy.repository';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';

describe('UpdateVacancyUseCase', () => {
  let useCase: UpdateVacancyUseCase;

  const mockRepo = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateVacancyUseCase,
        {
          provide: vacancyRepository.VACANCY_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<UpdateVacancyUseCase>(UpdateVacancyUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call update on the repository with correct params', async () => {
    const dto: UpdateVacancyDto = {
      title: 'Updated Title',
      role: 'Updated Role',
      jobDescription: 'Updated description',
      salaryRange: 'Updated Range',
    };
    const companyId = 5;
    const vacancyId = 1;

    mockRepo.update.mockResolvedValue({ id: vacancyId, ...dto });

    const result = await useCase.execute(vacancyId, companyId, dto);

    expect(mockRepo.update).toHaveBeenCalledWith(vacancyId, companyId, dto);
    expect(result).toEqual({ id: vacancyId, ...dto });
  });
});
