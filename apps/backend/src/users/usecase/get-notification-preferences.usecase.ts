import { Injectable, Inject } from "@nestjs/common";
import type { UserRepository } from "../repository/user.repository";
import { USER_REPOSITORY } from "../repository/user.repository";
import type { NotificationPreferences } from "../dto/update-notification-preferences.dto";

@Injectable()
export class GetNotificationPreferencesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<NotificationPreferences> {
    return this.userRepository.getNotificationPreferences(userId);
  }
}
