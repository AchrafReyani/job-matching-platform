import { Test, TestingModule } from "@nestjs/testing";
import { CompaniesController } from "./companies.controller";
import { GetCompanyByIdUseCase } from "../usecase/get-company-by-id.usecase";
import { GetAllCompaniesUseCase } from "../usecase/get-all-companies.usecase";
import { GetCompanyWithVacanciesUseCase } from "../usecase/get-company-with-vacancies.usecase";

describe("CompaniesController", () => {
  let controller: CompaniesController;
  const mockGetCompanyByIdUseCase = { execute: jest.fn() };
  const mockGetAllCompaniesUseCase = { execute: jest.fn() };
  const mockGetCompanyWithVacanciesUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        { provide: GetCompanyByIdUseCase, useValue: mockGetCompanyByIdUseCase },
        {
          provide: GetAllCompaniesUseCase,
          useValue: mockGetAllCompaniesUseCase,
        },
        {
          provide: GetCompanyWithVacanciesUseCase,
          useValue: mockGetCompanyWithVacanciesUseCase,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCompany", () => {
    it("should return company by id", async () => {
      const mockCompany = { id: 1, companyName: "Acme Corp", userId: "user-1" };
      mockGetCompanyByIdUseCase.execute.mockResolvedValue(mockCompany);

      const result = await controller.getCompany(1);

      expect(mockGetCompanyByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCompany);
    });
  });

  describe("getAllCompanies", () => {
    it("should return all companies", async () => {
      const mockCompanies = [
        { id: 1, companyName: "Acme Corp" },
        { id: 2, companyName: "Tech Inc" },
      ];
      mockGetAllCompaniesUseCase.execute.mockResolvedValue(mockCompanies);

      const result = await controller.getAllCompanies();

      expect(mockGetAllCompaniesUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCompanies);
    });
  });

  describe("getCompanyProfile", () => {
    it("should return company with vacancies", async () => {
      const mockCompanyWithVacancies = {
        id: 1,
        companyName: "TechCorp",
        userId: "user-1",
        websiteUrl: "https://techcorp.com",
        description: "A tech company",
        vacancies: [
          {
            id: 1,
            title: "Frontend Developer",
            salaryRange: "$100k - $120k",
            role: "Frontend",
            jobDescription: "Building UIs",
            createdAt: new Date("2024-01-15"),
          },
        ],
      };
      mockGetCompanyWithVacanciesUseCase.execute.mockResolvedValue(
        mockCompanyWithVacancies,
      );

      const result = await controller.getCompanyProfile(1);

      expect(mockGetCompanyWithVacanciesUseCase.execute).toHaveBeenCalledWith(
        1,
      );
      expect(result).toEqual(mockCompanyWithVacancies);
    });
  });
});
