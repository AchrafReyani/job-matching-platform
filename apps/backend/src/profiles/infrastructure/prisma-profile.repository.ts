import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  ProfileRepository,
  UserWithProfiles,
} from "../repository/profile.repository";

@Injectable()
export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserWithProfiles(userId: string): Promise<UserWithProfiles | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeeker: true,
        company: true,
      },
    });
  }
}
