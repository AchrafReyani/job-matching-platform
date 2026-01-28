import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { MarkMessagesReadUseCase } from "./mark-messages-read.usecase";
import {
  MESSAGE_REPOSITORY,
  MessageRepository,
} from "../repository/message.repository";

describe("MarkMessagesReadUseCase", () => {
  let useCase: MarkMessagesReadUseCase;
  let _messageRepository: MessageRepository;

  const mockMessageRepository = {
    findApplicationWithParticipants: jest.fn(),
    markMessagesAsRead: jest.fn(),
  };

  const mockApplication = {
    id: 1,
    status: "ACCEPTED",
    jobSeeker: {
      id: 1,
      user: { id: "jobseeker-user-1" },
      fullName: "John Doe",
    },
    vacancy: {
      id: 1,
      title: "Software Engineer",
      company: {
        id: 1,
        user: { id: "company-user-1" },
        companyName: "TechCorp",
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkMessagesReadUseCase,
        {
          provide: MESSAGE_REPOSITORY,
          useValue: mockMessageRepository,
        },
      ],
    }).compile();

    useCase = module.get<MarkMessagesReadUseCase>(MarkMessagesReadUseCase);
    _messageRepository = module.get<MessageRepository>(MESSAGE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should mark messages as read for job seeker", async () => {
      mockMessageRepository.findApplicationWithParticipants.mockResolvedValue(
        mockApplication,
      );
      mockMessageRepository.markMessagesAsRead.mockResolvedValue(3);

      const result = await useCase.execute(1, "jobseeker-user-1");

      expect(
        mockMessageRepository.findApplicationWithParticipants,
      ).toHaveBeenCalledWith(1);
      expect(mockMessageRepository.markMessagesAsRead).toHaveBeenCalledWith(
        1,
        "jobseeker-user-1",
      );
      expect(result).toBe(3);
    });

    it("should mark messages as read for company user", async () => {
      mockMessageRepository.findApplicationWithParticipants.mockResolvedValue(
        mockApplication,
      );
      mockMessageRepository.markMessagesAsRead.mockResolvedValue(5);

      const result = await useCase.execute(1, "company-user-1");

      expect(
        mockMessageRepository.findApplicationWithParticipants,
      ).toHaveBeenCalledWith(1);
      expect(mockMessageRepository.markMessagesAsRead).toHaveBeenCalledWith(
        1,
        "company-user-1",
      );
      expect(result).toBe(5);
    });

    it("should throw NotFoundException when application not found", async () => {
      mockMessageRepository.findApplicationWithParticipants.mockResolvedValue(
        null,
      );

      await expect(useCase.execute(999, "user-1")).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockMessageRepository.findApplicationWithParticipants,
      ).toHaveBeenCalledWith(999);
      expect(mockMessageRepository.markMessagesAsRead).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenException when user is not a participant", async () => {
      mockMessageRepository.findApplicationWithParticipants.mockResolvedValue(
        mockApplication,
      );

      await expect(useCase.execute(1, "unauthorized-user")).rejects.toThrow(
        ForbiddenException,
      );
      expect(
        mockMessageRepository.findApplicationWithParticipants,
      ).toHaveBeenCalledWith(1);
      expect(mockMessageRepository.markMessagesAsRead).not.toHaveBeenCalled();
    });

    it("should return 0 when no unread messages exist", async () => {
      mockMessageRepository.findApplicationWithParticipants.mockResolvedValue(
        mockApplication,
      );
      mockMessageRepository.markMessagesAsRead.mockResolvedValue(0);

      const result = await useCase.execute(1, "jobseeker-user-1");

      expect(result).toBe(0);
    });
  });
});
