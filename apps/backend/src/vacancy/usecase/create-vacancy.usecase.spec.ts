import { Test, TestingModule } from "@nestjs/testing";
import { CreateVacancyUseCase } from "./create-vacancy.usecase";
import { BadRequestException } from "@nestjs/common";
import { Vacancy } from "@prisma/client";
import * as vacancyRepository from "../repository/vacancy.repository";
import { CreateVacancyDto } from "../dto/create-vacancy.dto";

describe("CreateVacancyUseCase", () => {
  let useCase: CreateVacancyUseCase;
  const mockRepo = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVacancyUseCase,
        {
          provide: vacancyRepository.VACANCY_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateVacancyUseCase>(CreateVacancyUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call repository.create with correct arguments", async () => {
    const dto: CreateVacancyDto = {
      title: "Frontend Developer",
      role: "Frontend",
      jobDescription: "Build awesome UIs",
      salaryRange: "50k-70k",
    };
    const mockVacancy: Vacancy = {
      id: 1,
      companyId: 123,
      title: dto.title,
      role: dto.role,
      jobDescription: dto.jobDescription,
      salaryRange: dto.salaryRange ?? null,
      createdAt: new Date(),
    };
    mockRepo.create.mockResolvedValue(mockVacancy);

    const result = await useCase.execute(123, dto);

    expect(mockRepo.create).toHaveBeenCalledWith(123, dto);
    expect(result).toEqual(mockVacancy);
  });

  it("should throw BadRequestException if title, role, or jobDescription is missing", async () => {
    const incompleteDto = {
      title: "",
      role: "",
      jobDescription: "",
    } as CreateVacancyDto;

    await expect(useCase.execute(123, incompleteDto)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
