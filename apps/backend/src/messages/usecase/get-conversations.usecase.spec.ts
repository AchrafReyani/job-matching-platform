import { Test, TestingModule } from "@nestjs/testing";
import { GetConversationsUseCase } from "./get-conversations.usecase";
import {
  MESSAGE_REPOSITORY,
  MessageRepository,
  ConversationSummary,
} from "../repository/message.repository";

describe("GetConversationsUseCase", () => {
  let useCase: GetConversationsUseCase;
  let _messageRepository: MessageRepository;

  const mockMessageRepository = {
    getConversationsWithUnreadCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetConversationsUseCase,
        {
          provide: MESSAGE_REPOSITORY,
          useValue: mockMessageRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetConversationsUseCase>(GetConversationsUseCase);
    _messageRepository = module.get<MessageRepository>(MESSAGE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return conversations for job seeker", async () => {
      const mockConversations: ConversationSummary[] = [
        {
          applicationId: 1,
          vacancyId: 1,
          vacancyTitle: "Software Engineer",
          otherPartyName: "TechCorp",
          otherPartyUserId: "company-user-1",
          lastMessageText: "Hello, we reviewed your application",
          lastMessageAt: new Date(),
          unreadCount: 2,
        },
        {
          applicationId: 2,
          vacancyId: 2,
          vacancyTitle: "Full Stack Developer",
          otherPartyName: "StartupXYZ",
          otherPartyUserId: "company-user-2",
          lastMessageText: "When can you start?",
          lastMessageAt: new Date(),
          unreadCount: 0,
        },
      ];

      mockMessageRepository.getConversationsWithUnreadCount.mockResolvedValue(
        mockConversations,
      );

      const result = await useCase.execute("user-1");

      expect(
        mockMessageRepository.getConversationsWithUnreadCount,
      ).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockConversations);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no conversations exist", async () => {
      mockMessageRepository.getConversationsWithUnreadCount.mockResolvedValue(
        [],
      );

      const result = await useCase.execute("user-with-no-conversations");

      expect(
        mockMessageRepository.getConversationsWithUnreadCount,
      ).toHaveBeenCalledWith("user-with-no-conversations");
      expect(result).toEqual([]);
    });

    it("should return conversations for company user", async () => {
      const mockConversations: ConversationSummary[] = [
        {
          applicationId: 1,
          vacancyId: 1,
          vacancyTitle: "Software Engineer",
          otherPartyName: "John Doe",
          otherPartyUserId: "jobseeker-user-1",
          lastMessageText: "Thank you for considering me",
          lastMessageAt: new Date(),
          unreadCount: 1,
        },
      ];

      mockMessageRepository.getConversationsWithUnreadCount.mockResolvedValue(
        mockConversations,
      );

      const result = await useCase.execute("company-user-1");

      expect(
        mockMessageRepository.getConversationsWithUnreadCount,
      ).toHaveBeenCalledWith("company-user-1");
      expect(result).toEqual(mockConversations);
    });
  });
});
