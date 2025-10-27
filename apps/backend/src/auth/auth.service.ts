import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterJobSeekerDto } from './dto/register-jobseeker.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateJobSeekerDto } from './dto/update-jobseeker.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async registerJobSeeker(dto: RegisterJobSeekerDto) {
    const user = await this.usersService.createUser(dto.email, dto.password, 'JOB_SEEKER');

    await this.prisma.jobSeeker.create({
      data: {
        userId: user.id,
        fullName: dto.fullName,
        portfolioUrl: dto.portfolioUrl,
        experienceSummary: dto.experienceSummary,
      },
    });

    return { message: 'Job seeker registered successfully' };
  }

  async registerCompany(dto: RegisterCompanyDto) {
    const user = await this.usersService.createUser(dto.email, dto.password, 'COMPANY');

    await this.prisma.company.create({
      data: {
        userId: user.id,
        companyName: dto.companyName,
        websiteUrl: dto.websiteUrl,
        description: dto.description,
      },
    });

    return { message: 'Company registered successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string, role: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        jobSeeker: {
          select: { id: true, fullName: true, portfolioUrl: true, experienceSummary: true },
        },
        company: {
          select: { id: true, companyName: true, websiteUrl: true, description: true },
        },
      },
    });

    return user;
  }

  // 🟢 Edit Profile (unified)
  async editProfile(userId: string, role: string, dto: UpdateJobSeekerDto | UpdateCompanyDto) {
    if (role === 'JOB_SEEKER') {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({ where: { userId } });
      if (!jobSeeker) throw new NotFoundException('Job seeker profile not found');

      const updated = await this.prisma.jobSeeker.update({
        where: { userId },
        data: {
          fullName: (dto as UpdateJobSeekerDto).fullName,
          portfolioUrl: (dto as UpdateJobSeekerDto).portfolioUrl,
          experienceSummary: (dto as UpdateJobSeekerDto).experienceSummary,
        },
      });

      return { message: 'Profile updated successfully', updated };
    }

    if (role === 'COMPANY') {
      const company = await this.prisma.company.findUnique({ where: { userId } });
      if (!company) throw new NotFoundException('Company profile not found');

      const updated = await this.prisma.company.update({
        where: { userId },
        data: {
          companyName: (dto as UpdateCompanyDto).companyName,
          websiteUrl: (dto as UpdateCompanyDto).websiteUrl,
          description: (dto as UpdateCompanyDto).description,
        },
      });

      return { message: 'Company profile updated successfully', updated };
    }

    throw new BadRequestException('Invalid role for profile update');
  }
}
