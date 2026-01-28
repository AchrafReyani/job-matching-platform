import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import * as userRepository from "../repository/user.repository";

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject(userRepository.USER_REPOSITORY)
    private readonly userRepository: userRepository.UserRepository,
  ) {}

  async execute(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
}
