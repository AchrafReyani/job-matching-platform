import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { LoginUseCase } from "../usecase/login.usecase";

describe("AuthController", () => {
  let controller: AuthController;
  const mockLoginUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: LoginUseCase, useValue: mockLoginUseCase }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return access token", async () => {
      const mockResult = { access_token: "jwt-token" };
      mockLoginUseCase.execute.mockResolvedValue(mockResult);

      const dto = { email: "test@example.com", password: "password123" };
      const result = await controller.login(dto);

      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });
});
