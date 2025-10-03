import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async registerJobSeeker(dto: any) { //todo update with actual dto
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

  async registerCompany(dto: any) { //todo update with actual dto
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

  async login(email: string, password: string) {
    const user = await this.usersService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}