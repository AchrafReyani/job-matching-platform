import { UpdateNotificationPreferencesUseCase } from "./update-notification-preferences.usecase";
import type { UserRepository } from "../repository/user.repository";

describe("UpdateNotificationPreferencesUseCase", () => {
  let useCase: UpdateNotificationPreferencesUseCase;
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

    useCase = new UpdateNotificationPreferencesUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update notification preferences and return updated preferences", async () => {
    const newPrefs = { applicationAccepted: false };
    const updatedPrefs = {
      applicationAccepted: false,
      applicationRejected: true,
      newMessages: true,
    };

    mockUserRepository.updateNotificationPreferences.mockResolvedValue(
      undefined,
    );
    mockUserRepository.getNotificationPreferences.mockResolvedValue(
      updatedPrefs,
    );

    const result = await useCase.execute("user-123", newPrefs);

    expect(result).toEqual(updatedPrefs);
    expect(
      mockUserRepository.updateNotificationPreferences,
    ).toHaveBeenCalledWith("user-123", newPrefs);
    expect(mockUserRepository.getNotificationPreferences).toHaveBeenCalledWith(
      "user-123",
    );
  });

  it("should handle partial preference updates", async () => {
    const newPrefs = { newMessages: false };
    const updatedPrefs = {
      newApplications: true,
      newMessages: false,
      applicationWithdrawn: true,
    };

    mockUserRepository.updateNotificationPreferences.mockResolvedValue(
      undefined,
    );
    mockUserRepository.getNotificationPreferences.mockResolvedValue(
      updatedPrefs,
    );

    const result = await useCase.execute("company-123", newPrefs);

    expect(result).toEqual(updatedPrefs);
  });
});
