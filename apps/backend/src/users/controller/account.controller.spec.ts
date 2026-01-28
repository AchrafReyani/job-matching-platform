import { Test, TestingModule } from "@nestjs/testing";
import { AccountController } from "./account.controller";
import { ChangePasswordUseCase } from "../usecase/change-password.usecase";
import { GetNotificationPreferencesUseCase } from "../usecase/get-notification-preferences.usecase";
import { UpdateNotificationPreferencesUseCase } from "../usecase/update-notification-preferences.usecase";
import { DeleteAccountUseCase } from "../usecase/delete-account.usecase";
import { ThrottlerModule } from "@nestjs/throttler";

describe("AccountController", () => {
  let controller: AccountController;
  let changePasswordUseCase: jest.Mocked<ChangePasswordUseCase>;
  let getNotificationPreferencesUseCase: jest.Mocked<GetNotificationPreferencesUseCase>;
  let updateNotificationPreferencesUseCase: jest.Mocked<UpdateNotificationPreferencesUseCase>;
  let deleteAccountUseCase: jest.Mocked<DeleteAccountUseCase>;

  const mockRequest = {
    user: {
      userId: "user-123",
      role: "JOB_SEEKER",
    },
  };

  beforeEach(async () => {
    const mockChangePasswordUseCase = {
      execute: jest.fn(),
    };

    const mockGetNotificationPreferencesUseCase = {
      execute: jest.fn(),
    };

    const mockUpdateNotificationPreferencesUseCase = {
      execute: jest.fn(),
    };

    const mockDeleteAccountUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 10,
          },
        ]),
      ],
      controllers: [AccountController],
      providers: [
        { provide: ChangePasswordUseCase, useValue: mockChangePasswordUseCase },
        {
          provide: GetNotificationPreferencesUseCase,
          useValue: mockGetNotificationPreferencesUseCase,
        },
        {
          provide: UpdateNotificationPreferencesUseCase,
          useValue: mockUpdateNotificationPreferencesUseCase,
        },
        { provide: DeleteAccountUseCase, useValue: mockDeleteAccountUseCase },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    changePasswordUseCase = module.get(ChangePasswordUseCase);
    getNotificationPreferencesUseCase = module.get(
      GetNotificationPreferencesUseCase,
    );
    updateNotificationPreferencesUseCase = module.get(
      UpdateNotificationPreferencesUseCase,
    );
    deleteAccountUseCase = module.get(DeleteAccountUseCase);
  });

  describe("changePassword", () => {
    it("should call ChangePasswordUseCase with correct parameters", async () => {
      changePasswordUseCase.execute.mockResolvedValue(undefined);

      await controller.changePassword(mockRequest as never, {
        currentPassword: "oldPassword",
        newPassword: "newPassword123",
      });

      expect(changePasswordUseCase.execute).toHaveBeenCalledWith({
        userId: "user-123",
        currentPassword: "oldPassword",
        newPassword: "newPassword123",
      });
    });
  });

  describe("getNotificationPreferences", () => {
    it("should return notification preferences", async () => {
      const mockPrefs = {
        applicationAccepted: true,
        applicationRejected: true,
        newMessages: true,
      };
      getNotificationPreferencesUseCase.execute.mockResolvedValue(mockPrefs);

      const result = await controller.getNotificationPreferences(
        mockRequest as never,
      );

      expect(result).toEqual(mockPrefs);
      expect(getNotificationPreferencesUseCase.execute).toHaveBeenCalledWith(
        "user-123",
      );
    });
  });

  describe("updateNotificationPreferences", () => {
    it("should update and return notification preferences", async () => {
      const newPrefs = { applicationAccepted: false };
      const updatedPrefs = {
        applicationAccepted: false,
        applicationRejected: true,
        newMessages: true,
      };
      updateNotificationPreferencesUseCase.execute.mockResolvedValue(
        updatedPrefs,
      );

      const result = await controller.updateNotificationPreferences(
        mockRequest as never,
        newPrefs,
      );

      expect(result).toEqual(updatedPrefs);
      expect(updateNotificationPreferencesUseCase.execute).toHaveBeenCalledWith(
        "user-123",
        newPrefs,
      );
    });
  });

  describe("deleteAccount", () => {
    it("should call DeleteAccountUseCase with correct parameters", async () => {
      deleteAccountUseCase.execute.mockResolvedValue(undefined);

      await controller.deleteAccount(mockRequest as never, {
        password: "password",
        confirmation: "DELETE",
      });

      expect(deleteAccountUseCase.execute).toHaveBeenCalledWith({
        userId: "user-123",
        password: "password",
        confirmation: "DELETE",
      });
    });
  });
});
