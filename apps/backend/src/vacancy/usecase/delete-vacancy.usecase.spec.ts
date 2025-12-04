import { Test, TestingModule } from '@nestjs/testing';
import { DeleteVacancyUseCase } from './delete-vacancy.usecase';
import * as vacancyRepository from '../repository/vacancy.repository';

describe('DeleteVacancyUseCase', () => {
  let useCase: DeleteVacancyUseCase;
  const mockRepo = {
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteVacancyUseCase,
        {
          provide: vacancyRepository.VACANCY_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<DeleteVacancyUseCase>(DeleteVacancyUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call repository.delete with correct id and companyId', async () => {
    mockRepo.delete.mockResolvedValue({ success: true });

    const result = await useCase.execute(1, 123);

    expect(mockRepo.delete).toHaveBeenCalledWith(1, 123);
    expect(result).toEqual({ success: true });
  });
});
