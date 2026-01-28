import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateMessageDto } from '../dto/create-message.dto';
import { CreateMessageUseCase } from '../usecase/create-message.usecase';
import { GetMessagesUseCase } from '../usecase/get-messages.usecase';
import { GetConversationsUseCase } from '../usecase/get-conversations.usecase';
import { MarkMessagesReadUseCase } from '../usecase/mark-messages-read.usecase';
import {
  AuthenticatedRequest,
  getUserId,
} from '../../common/interfaces/authenticated-request.interface';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly markMessagesReadUseCase: MarkMessagesReadUseCase,
  ) {}

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateMessageDto,
  ) {
    return this.createMessageUseCase.execute(getUserId(req), dto);
  }

  @Get('conversations')
  async getConversations(@Request() req: AuthenticatedRequest) {
    return this.getConversationsUseCase.execute(getUserId(req));
  }

  @Get(':applicationId')
  async getMessages(
    @Request() req: AuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ) {
    return this.getMessagesUseCase.execute(applicationId, getUserId(req));
  }

  @Patch(':applicationId/read')
  async markMessagesAsRead(
    @Request() req: AuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ) {
    const count = await this.markMessagesReadUseCase.execute(
      applicationId,
      getUserId(req),
    );
    return { markedAsRead: count };
  }
}
