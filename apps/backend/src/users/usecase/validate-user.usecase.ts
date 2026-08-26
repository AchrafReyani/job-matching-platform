import { Injectable, Inject } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as userRepository from '../repository/user.repository';

@Injectable()
export class ValidateUserUseCase {
  constructor(
    @Inject(userRepository.USER_REPOSITORY)
    private readonly userRepository: userRepository.UserRepository,
  ) {}

  async execute(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);

    // LINE-only accounts have no password to validate.
    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
