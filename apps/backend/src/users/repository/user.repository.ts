import { User, Role } from '@prisma/client';

export interface UserRepository {
  create(email: string, passwordHash: string, role: Role): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
