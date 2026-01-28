import { Test, TestingModule } from "@nestjs/testing";
import { GetVacanciesUseCase } from "./get-vacancies.usecase";
import * as vacancyRepository from "../repository/vacancy.repository";

describe("GetVacanciesUseCase", () => {
  let useCase: GetVacanciesUseCase;

  const mockRepo = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetVacanciesUseCase,
        {
          provide: vacancyRepository.VACANCY_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetVacanciesUseCase>(GetVacanciesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call repository.findAll and return the vacancies", async () => {
    const mockVacancies = [
      { id: 1, title: "Frontend Dev" },
      { id: 2, title: "Backend Dev" },
    ];
    mockRepo.findAll.mockResolvedValue(mockVacancies);

    const result = await useCase.execute();

    expect(mockRepo.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockVacancies);
  });
});
