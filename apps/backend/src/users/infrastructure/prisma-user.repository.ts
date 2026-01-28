import { Injectable } from "@nestjs/common";
import { User, Role } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRepository } from "../repository/user.repository";
import { NotificationPreferences } from "../dto/update-notification-preferences.dto";

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, passwordHash: string, role: Role): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async getNotificationPreferences(
    id: string,
  ): Promise<NotificationPreferences> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { notificationPreferences: true, role: true },
    });

    if (!user) {
      return {};
    }

    const prefs =
      user.notificationPreferences as NotificationPreferences | null;

    // Return defaults based on role if no preferences set
    if (!prefs || Object.keys(prefs).length === 0) {
      if (user.role === "JOB_SEEKER") {
        return {
          applicationAccepted: true,
          applicationRejected: true,
          newMessages: true,
        };
      } else if (user.role === "COMPANY") {
        return {
          newApplications: true,
          newMessages: true,
          applicationWithdrawn: true,
        };
      }
    }

    return prefs || {};
  }

  async updateNotificationPreferences(
    id: string,
    preferences: NotificationPreferences,
  ): Promise<void> {
    const currentPrefs = await this.getNotificationPreferences(id);
    const mergedPrefs = { ...currentPrefs, ...preferences };

    await this.prisma.user.update({
      where: { id },
      data: { notificationPreferences: mergedPrefs },
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
}
