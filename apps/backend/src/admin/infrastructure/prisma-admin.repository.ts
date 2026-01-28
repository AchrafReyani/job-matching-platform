import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  AdminRepository,
  AdminStats,
  UserListItem,
  UserDetails,
  VacancyListItem,
  VacancyDetails,
  PaginatedResult,
  UserFilter,
  VacancyFilter,
} from "../repository/admin.repository";

@Injectable()
export class PrismaAdminRepository implements AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<AdminStats> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [
      totalJobSeekers,
      totalCompanies,
      totalVacancies,
      totalApplications,
      activeVacancies,
      pendingApplications,
      newUsersThisWeek,
      applicationsThisMonth,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: "JOB_SEEKER" } }),
      this.prisma.user.count({ where: { role: "COMPANY" } }),
      this.prisma.vacancy.count(),
      this.prisma.application.count(),
      this.prisma.vacancy.count(), // All vacancies are "active" - no status field
      this.prisma.application.count({ where: { status: "APPLIED" } }),
      this.prisma.user.count({
        where: {
          role: { in: ["JOB_SEEKER", "COMPANY"] },
          createdAt: { gte: oneWeekAgo },
        },
      }),
      this.prisma.application.count({
        where: { appliedAt: { gte: oneMonthAgo } },
      }),
    ]);

    return {
      totalJobSeekers,
      totalCompanies,
      totalVacancies,
      totalApplications,
      activeVacancies,
      pendingApplications,
      newUsersThisWeek,
      applicationsThisMonth,
    };
  }

  async getUsers(filter: UserFilter): Promise<PaginatedResult<UserListItem>> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {
      role: { not: "ADMIN" },
    };

    if (filter.role) {
      where.role = filter.role;
    }

    if (filter.search) {
      where.OR = [
        { email: { contains: filter.search, mode: "insensitive" } },
        {
          jobSeeker: {
            fullName: { contains: filter.search, mode: "insensitive" },
          },
        },
        {
          company: {
            companyName: { contains: filter.search, mode: "insensitive" },
          },
        },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (filter.sortBy === "createdAt") {
      orderBy.createdAt = filter.sortOrder || "desc";
    } else if (filter.sortBy === "email") {
      orderBy.email = filter.sortOrder || "asc";
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy:
          Object.keys(orderBy).length > 0 ? orderBy : { createdAt: "desc" },
        include: {
          jobSeeker: { select: { fullName: true } },
          company: { select: { companyName: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const data: UserListItem[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.jobSeeker?.fullName || user.company?.companyName || "",
      role: user.role,
      createdAt: user.createdAt,
    }));

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getUserById(id: string): Promise<UserDetails | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        jobSeeker: true,
        company: true,
      },
    });

    if (!user) return null;

    let profile: UserDetails["profile"] = null;
    if (user.jobSeeker) {
      profile = {
        name: user.jobSeeker.fullName,
        websiteUrl: user.jobSeeker.portfolioUrl,
        description: user.jobSeeker.experienceSummary,
      };
    } else if (user.company) {
      profile = {
        name: user.company.companyName,
        websiteUrl: user.company.websiteUrl,
        description: user.company.description,
      };
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      profile,
    };
  }

  async updateUser(
    id: string,
    data: {
      email?: string;
      name?: string;
      websiteUrl?: string;
      description?: string;
    },
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { jobSeeker: true, company: true },
    });

    if (!user) return;

    await this.prisma.$transaction(async (tx) => {
      if (data.email) {
        await tx.user.update({
          where: { id },
          data: { email: data.email },
        });
      }

      if (user.jobSeeker) {
        await tx.jobSeeker.update({
          where: { userId: id },
          data: {
            fullName: data.name,
            portfolioUrl: data.websiteUrl,
            experienceSummary: data.description,
          },
        });
      } else if (user.company) {
        await tx.company.update({
          where: { userId: id },
          data: {
            companyName: data.name,
            websiteUrl: data.websiteUrl,
            description: data.description,
          },
        });
      }
    });
  }

  async deleteUser(id: string, archivedBy: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        jobSeeker: {
          include: {
            applications: {
              include: {
                vacancy: true,
                messages: true,
              },
            },
          },
        },
        company: {
          include: {
            Vacancy: {
              include: {
                applications: {
                  include: {
                    jobSeeker: true,
                    messages: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return;

    await this.prisma.$transaction(async (tx) => {
      // Archive user data
      const profileData = user.jobSeeker
        ? {
            type: "JOB_SEEKER",
            fullName: user.jobSeeker.fullName,
            portfolioUrl: user.jobSeeker.portfolioUrl,
            experienceSummary: user.jobSeeker.experienceSummary,
          }
        : user.company
          ? {
              type: "COMPANY",
              companyName: user.company.companyName,
              websiteUrl: user.company.websiteUrl,
              description: user.company.description,
            }
          : {};

      await tx.archivedUser.create({
        data: {
          originalId: user.id,
          email: user.email,
          role: user.role,
          profileData,
          archivedBy,
        },
      });

      // Archive and delete applications for job seeker
      if (user.jobSeeker) {
        for (const app of user.jobSeeker.applications) {
          await tx.archivedApplication.create({
            data: {
              originalId: app.id,
              vacancyTitle: app.vacancy.title,
              seekerName: user.jobSeeker.fullName,
              status: app.status,
              messageCount: app.messages.length,
              archivedBy,
            },
          });
        }

        // Delete messages first
        await tx.message.deleteMany({
          where: {
            application: {
              jobSeekerId: user.jobSeeker.id,
            },
          },
        });

        // Delete applications
        await tx.application.deleteMany({
          where: { jobSeekerId: user.jobSeeker.id },
        });

        // Delete job seeker profile
        await tx.jobSeeker.delete({
          where: { userId: id },
        });
      }

      // Archive vacancies and applications for company
      if (user.company) {
        for (const vacancy of user.company.Vacancy) {
          await tx.archivedVacancy.create({
            data: {
              originalId: vacancy.id,
              companyName: user.company.companyName,
              title: vacancy.title,
              salaryRange: vacancy.salaryRange,
              role: vacancy.role,
              jobDescription: vacancy.jobDescription,
              applicationCount: vacancy.applications.length,
              archivedBy,
            },
          });

          for (const app of vacancy.applications) {
            await tx.archivedApplication.create({
              data: {
                originalId: app.id,
                vacancyTitle: vacancy.title,
                seekerName: app.jobSeeker.fullName,
                status: app.status,
                messageCount: app.messages.length,
                archivedBy,
              },
            });
          }
        }

        // Delete messages for all applications on company's vacancies
        await tx.message.deleteMany({
          where: {
            application: {
              vacancy: {
                companyId: user.company.id,
              },
            },
          },
        });

        // Delete applications for all company vacancies
        await tx.application.deleteMany({
          where: {
            vacancy: {
              companyId: user.company.id,
            },
          },
        });

        // Delete all vacancies
        await tx.vacancy.deleteMany({
          where: { companyId: user.company.id },
        });

        // Delete company profile
        await tx.company.delete({
          where: { userId: id },
        });
      }

      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId: id },
      });

      // Delete messages sent by this user
      await tx.message.deleteMany({
        where: { senderId: id },
      });

      // Finally delete the user
      await tx.user.delete({ where: { id } });
    });
  }

  async deleteAllJobSeekers(archivedBy: string): Promise<number> {
    const jobSeekers = await this.prisma.user.findMany({
      where: { role: "JOB_SEEKER" },
      select: { id: true },
    });

    for (const seeker of jobSeekers) {
      await this.deleteUser(seeker.id, archivedBy);
    }

    return jobSeekers.length;
  }

  async deleteAllCompanies(archivedBy: string): Promise<number> {
    const companies = await this.prisma.user.findMany({
      where: { role: "COMPANY" },
      select: { id: true },
    });

    for (const company of companies) {
      await this.deleteUser(company.id, archivedBy);
    }

    return companies.length;
  }

  async getVacancies(
    filter: VacancyFilter,
  ): Promise<PaginatedResult<VacancyListItem>> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (filter.companyId) {
      where.companyId = filter.companyId;
    }

    if (filter.search) {
      where.title = { contains: filter.search, mode: "insensitive" };
    }

    const orderBy: Record<string, unknown> = {};
    if (filter.sortBy === "createdAt") {
      orderBy.createdAt = filter.sortOrder || "desc";
    } else if (filter.sortBy === "title") {
      orderBy.title = filter.sortOrder || "asc";
    } else if (filter.sortBy === "company") {
      orderBy.company = { companyName: filter.sortOrder || "asc" };
    }

    const [vacancies, total] = await Promise.all([
      this.prisma.vacancy.findMany({
        where,
        skip,
        take: pageSize,
        orderBy:
          Object.keys(orderBy).length > 0 ? orderBy : { createdAt: "desc" },
        include: {
          company: { select: { companyName: true } },
          _count: { select: { applications: true } },
        },
      }),
      this.prisma.vacancy.count({ where }),
    ]);

    const data: VacancyListItem[] = vacancies.map((vacancy) => ({
      id: vacancy.id,
      title: vacancy.title,
      companyName: vacancy.company.companyName,
      role: vacancy.role,
      applicationCount: vacancy._count.applications,
      createdAt: vacancy.createdAt,
    }));

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getVacancyById(id: number): Promise<VacancyDetails | null> {
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, companyName: true } },
      },
    });

    if (!vacancy) return null;

    return {
      id: vacancy.id,
      title: vacancy.title,
      salaryRange: vacancy.salaryRange,
      role: vacancy.role,
      jobDescription: vacancy.jobDescription,
      createdAt: vacancy.createdAt,
      companyId: vacancy.company.id,
      companyName: vacancy.company.companyName,
    };
  }

  async updateVacancy(
    id: number,
    data: {
      title?: string;
      salaryRange?: string;
      role?: string;
      jobDescription?: string;
    },
  ): Promise<void> {
    await this.prisma.vacancy.update({
      where: { id },
      data,
    });
  }

  async deleteVacancy(id: number, archivedBy: string): Promise<void> {
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id },
      include: {
        company: { select: { companyName: true } },
        applications: {
          include: {
            jobSeeker: { select: { fullName: true } },
            messages: true,
          },
        },
      },
    });

    if (!vacancy) return;

    await this.prisma.$transaction(async (tx) => {
      // Archive vacancy
      await tx.archivedVacancy.create({
        data: {
          originalId: vacancy.id,
          companyName: vacancy.company.companyName,
          title: vacancy.title,
          salaryRange: vacancy.salaryRange,
          role: vacancy.role,
          jobDescription: vacancy.jobDescription,
          applicationCount: vacancy.applications.length,
          archivedBy,
        },
      });

      // Archive applications
      for (const app of vacancy.applications) {
        await tx.archivedApplication.create({
          data: {
            originalId: app.id,
            vacancyTitle: vacancy.title,
            seekerName: app.jobSeeker.fullName,
            status: app.status,
            messageCount: app.messages.length,
            archivedBy,
          },
        });
      }

      // Delete vacancy (cascades to applications and messages)
      await tx.vacancy.delete({ where: { id } });
    });
  }

  async deleteAllVacancies(archivedBy: string): Promise<number> {
    const vacancies = await this.prisma.vacancy.findMany({
      select: { id: true },
    });

    for (const vacancy of vacancies) {
      await this.deleteVacancy(vacancy.id, archivedBy);
    }

    return vacancies.length;
  }
}
