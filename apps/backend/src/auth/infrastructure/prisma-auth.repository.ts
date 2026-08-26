import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthRepository,
  CreateLineUserData,
} from '../repository/auth.repository';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserByLineSub(lineSub: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { lineSub } });
  }

  async createLineUser(data: CreateLineUserData): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          lineSub: data.lineSub,
          role: data.role,
          lineFriend: data.lineFriend ?? null,
        },
      });

      if (data.role === 'COMPANY') {
        await tx.company.create({
          data: { userId: user.id, companyName: data.displayName },
        });
      } else {
        await tx.jobSeeker.create({
          data: { userId: user.id, fullName: data.displayName },
        });
      }

      return user;
    });
  }

  async setLineFriend(userId: string, friend: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lineFriend: friend },
    });
  }
}
