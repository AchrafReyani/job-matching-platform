import { Injectable, Inject, ConflictException } from "@nestjs/common";
import { User, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as userRepository from "../repository/user.repository";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(userRepository.USER_REPOSITORY)
    private readonly userRepository: userRepository.UserRepository,
  ) {}

  async execute(email: string, password: string, role: Role): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return this.userRepository.create(email, passwordHash, role);
  }
}
