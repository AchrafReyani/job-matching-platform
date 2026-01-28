import { Injectable, Inject } from "@nestjs/common";
import * as messageRepository from "../repository/message.repository";

@Injectable()
export class GetConversationsUseCase {
  constructor(
    @Inject(messageRepository.MESSAGE_REPOSITORY)
    private readonly messageRepository: messageRepository.MessageRepository,
  ) {}

  async execute(
    userId: string,
  ): Promise<messageRepository.ConversationSummary[]> {
    return this.messageRepository.getConversationsWithUnreadCount(userId);
  }
}
