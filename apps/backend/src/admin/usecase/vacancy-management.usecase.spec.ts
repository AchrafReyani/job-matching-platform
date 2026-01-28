import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import {
  GetVacanciesUseCase,
  GetVacancyByIdUseCase,
  UpdateVacancyUseCase,
  DeleteVacancyUseCase,
  DeleteAllVacanciesUseCase,
} from "./vacancy-management.usecase";
import { ADMIN_REPOSITORY } from "../repository/admin.repository";

describe("Vacancy Management Use Cases", () => {
  const mockRepo = {
    getVacancies: jest.fn(),
    getVacancyById: jest.fn(),
    updateVacancy: jest.fn(),
    deleteVacancy: jest.fn(),
    deleteAllVacancies: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GetVacanciesUseCase", () => {
    let useCase: GetVacanciesUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GetVacanciesUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<GetVacanciesUseCase>(GetVacanciesUseCase);
    });

    it("should return paginated vacancies", async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            title: "Software Engineer",
            companyName: "TechCorp",
            role: "Engineer",
            applicationCount: 5,
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };
      mockRepo.getVacancies.mockResolvedValue(mockResult);

      const result = await useCase.execute({ page: 1, pageSize: 10 });

      expect(mockRepo.getVacancies).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("Software Engineer");
    });

    it("should filter by search term", async () => {
      mockRepo.getVacancies.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });

      await useCase.execute({ search: "engineer" });

      expect(mockRepo.getVacancies).toHaveBeenCalledWith({
        search: "engineer",
      });
    });

    it("should filter by company", async () => {
      mockRepo.getVacancies.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });

      await useCase.execute({ companyId: 1 });

      expect(mockRepo.getVacancies).toHaveBeenCalledWith({ companyId: 1 });
    });
  });

  describe("GetVacancyByIdUseCase", () => {
    let useCase: GetVacancyByIdUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GetVacancyByIdUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<GetVacancyByIdUseCase>(GetVacancyByIdUseCase);
    });

    it("should return vacancy details", async () => {
      const mockVacancy = {
        id: 1,
        title: "Software Engineer",
        salaryRange: "$100k-$150k",
        role: "Engineer",
        jobDescription: "Build software",
        createdAt: new Date(),
        companyId: 1,
        companyName: "TechCorp",
      };
      mockRepo.getVacancyById.mockResolvedValue(mockVacancy);

      const result = await useCase.execute(1);

      expect(mockRepo.getVacancyById).toHaveBeenCalledWith(1);
      expect(result.title).toBe("Software Engineer");
      expect(result.companyName).toBe("TechCorp");
    });

    it("should throw NotFoundException when vacancy not found", async () => {
      mockRepo.getVacancyById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("UpdateVacancyUseCase", () => {
    let useCase: UpdateVacancyUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateVacancyUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<UpdateVacancyUseCase>(UpdateVacancyUseCase);
    });

    it("should update vacancy successfully", async () => {
      const mockVacancy = { id: 1, title: "Old Title" };
      mockRepo.getVacancyById.mockResolvedValue(mockVacancy);
      mockRepo.updateVacancy.mockResolvedValue(undefined);

      await useCase.execute(1, { title: "New Title" });

      expect(mockRepo.updateVacancy).toHaveBeenCalledWith(1, {
        title: "New Title",
      });
    });

    it("should throw NotFoundException when vacancy not found", async () => {
      mockRepo.getVacancyById.mockResolvedValue(null);

      await expect(
        useCase.execute(999, { title: "New Title" }),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.updateVacancy).not.toHaveBeenCalled();
    });

    it("should update multiple fields", async () => {
      mockRepo.getVacancyById.mockResolvedValue({ id: 1 });
      mockRepo.updateVacancy.mockResolvedValue(undefined);

      await useCase.execute(1, {
        title: "New Title",
        salaryRange: "$120k-$180k",
        jobDescription: "Updated description",
      });

      expect(mockRepo.updateVacancy).toHaveBeenCalledWith(1, {
        title: "New Title",
        salaryRange: "$120k-$180k",
        jobDescription: "Updated description",
      });
    });
  });

  describe("DeleteVacancyUseCase", () => {
    let useCase: DeleteVacancyUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteVacancyUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<DeleteVacancyUseCase>(DeleteVacancyUseCase);
    });

    it("should delete vacancy successfully", async () => {
      mockRepo.getVacancyById.mockResolvedValue({
        id: 1,
        title: "Test Vacancy",
      });
      mockRepo.deleteVacancy.mockResolvedValue(undefined);

      await useCase.execute(1, "admin-1");

      expect(mockRepo.deleteVacancy).toHaveBeenCalledWith(1, "admin-1");
    });

    it("should throw NotFoundException when vacancy not found", async () => {
      mockRepo.getVacancyById.mockResolvedValue(null);

      await expect(useCase.execute(999, "admin-1")).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.deleteVacancy).not.toHaveBeenCalled();
    });
  });

  describe("DeleteAllVacanciesUseCase", () => {
    let useCase: DeleteAllVacanciesUseCase;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteAllVacanciesUseCase,
          { provide: ADMIN_REPOSITORY, useValue: mockRepo },
        ],
      }).compile();

      useCase = module.get<DeleteAllVacanciesUseCase>(
        DeleteAllVacanciesUseCase,
      );
    });

    it("should delete all vacancies and return count", async () => {
      mockRepo.deleteAllVacancies.mockResolvedValue(10);

      const result = await useCase.execute("admin-1");

      expect(mockRepo.deleteAllVacancies).toHaveBeenCalledWith("admin-1");
      expect(result).toBe(10);
    });

    it("should return 0 when no vacancies to delete", async () => {
      mockRepo.deleteAllVacancies.mockResolvedValue(0);

      const result = await useCase.execute("admin-1");

      expect(result).toBe(0);
    });
  });
});
