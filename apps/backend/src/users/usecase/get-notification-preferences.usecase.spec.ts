import { GetNotificationPreferencesUseCase } from "./get-notification-preferences.usecase";
import type { UserRepository } from "../repository/user.repository";

describe("GetNotificationPreferencesUseCase", () => {
  let useCase: GetNotificationPreferencesUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
      getNotificationPreferences: jest.fn(),
      updateNotificationPreferences: jest.fn(),
      deleteUser: jest.fn(),
    };

    useCase = new GetNotificationPreferencesUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return notification preferences for job seeker", async () => {
    const mockPrefs = {
      applicationAccepted: true,
      applicationRejected: true,
      newMessages: false,
    };
    mockUserRepository.getNotificationPreferences.mockResolvedValue(mockPrefs);

    const result = await useCase.execute("user-123");

    expect(result).toEqual(mockPrefs);
    expect(mockUserRepository.getNotificationPreferences).toHaveBeenCalledWith(
      "user-123",
    );
  });

  it("should return notification preferences for company", async () => {
    const mockPrefs = {
      newApplications: true,
      newMessages: true,
      applicationWithdrawn: false,
    };
    mockUserRepository.getNotificationPreferences.mockResolvedValue(mockPrefs);

    const result = await useCase.execute("company-123");

    expect(result).toEqual(mockPrefs);
    expect(mockUserRepository.getNotificationPreferences).toHaveBeenCalledWith(
      "company-123",
    );
  });

  it("should return empty object if no preferences set", async () => {
    mockUserRepository.getNotificationPreferences.mockResolvedValue({});

    const result = await useCase.execute("user-123");

    expect(result).toEqual({});
  });
});
