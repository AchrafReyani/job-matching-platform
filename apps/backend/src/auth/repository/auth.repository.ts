import { Role, User } from '@prisma/client';

export interface CreateLineUserData {
  /** Stable subject from the renkei id_token. */
  lineSub: string;
  email: string;
  role: Role;
  /** Display name from LINE; becomes the job seeker's fullName or the company's companyName. */
  displayName: string;
}

export interface AuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserByLineSub(lineSub: string): Promise<User | null>;
  /** Creates the user and its role profile in one transaction. */
  createLineUser(data: CreateLineUserData): Promise<User>;
}

export const AUTH_REPOSITORY = Symbol('AuthRepository');
