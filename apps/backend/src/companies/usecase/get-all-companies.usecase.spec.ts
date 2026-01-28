import { Test, TestingModule } from "@nestjs/testing";
import { GetAllCompaniesUseCase } from "./get-all-companies.usecase";
import * as companyRepository from "../repository/company.repository";

describe("GetAllCompaniesUseCase", () => {
  let useCase: GetAllCompaniesUseCase;
  const mockRepo = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllCompaniesUseCase,
        {
          provide: companyRepository.COMPANY_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetAllCompaniesUseCase>(GetAllCompaniesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return all companies", async () => {
    const companies = [
      { id: 1, companyName: "Acme Corp", userId: "user-1" },
      { id: 2, companyName: "Tech Inc", userId: "user-2" },
    ];
    mockRepo.findAll.mockResolvedValue(companies);

    const result = await useCase.execute();

    expect(mockRepo.findAll).toHaveBeenCalled();
    expect(result).toEqual(companies);
  });

  it("should return empty array if no companies", async () => {
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
