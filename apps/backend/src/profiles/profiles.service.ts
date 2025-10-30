import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeeker: true,
        company: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.role === 'JOB_SEEKER') {
      return {
        userId: user.id,
        role: user.role,
        profile: {
          fullName: user.jobSeeker?.fullName,
          portfolioUrl: user.jobSeeker?.portfolioUrl,
          experienceSummary: user.jobSeeker?.experienceSummary,
        },
      };
    }

    if (user.role === 'COMPANY') {
      return {
        userId: user.id,
        role: user.role,
        profile: {
          companyName: user.company?.companyName,
          websiteUrl: user.company?.websiteUrl,
          description: user.company?.description,
        },
      };
    }

    // In case role is missing or inconsistent
    throw new NotFoundException('Profile not found for this user');
  }
}
