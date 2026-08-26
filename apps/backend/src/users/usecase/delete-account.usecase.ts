import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { UserRepository } from '../repository/user.repository';
import { USER_REPOSITORY } from '../repository/user.repository';

interface DeleteAccountInput {
  userId: string;
  password: string;
  confirmation: string;
}

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: DeleteAccountInput): Promise<void> {
    // Validate confirmation
    if (input.confirmation !== 'DELETE') {
      throw new BadRequestException('Confirmation must be exactly "DELETE"');
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Prevent admin from deleting their own account
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Admin accounts cannot be self-deleted');
    }

    // Verify password. LINE-only accounts have none; the DELETE confirmation
    // is the only check we can ask of them.
    const isPasswordValid = user.passwordHash
      ? await bcrypt.compare(input.password, user.passwordHash)
      : true;
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    // Delete the account (archives data first)
    await this.userRepository.deleteUser(input.userId, input.userId);
  }
}
