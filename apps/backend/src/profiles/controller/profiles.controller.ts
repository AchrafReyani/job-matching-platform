import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { GetPublicProfileUseCase } from "../usecase/get-public-profile.usecase";

@Controller("profiles")
export class ProfilesController {
  constructor(
    private readonly getPublicProfileUseCase: GetPublicProfileUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getProfile(@Param("id") id: string) {
    return this.getPublicProfileUseCase.execute(id);
  }
}
