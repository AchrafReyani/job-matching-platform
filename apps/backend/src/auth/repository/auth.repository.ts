import { User } from '@prisma/client';

export interface AuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
}

export const AUTH_REPOSITORY = Symbol('AuthRepository');
