import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateMessageDto } from '../dto/create-message.dto';
import { CreateMessageUseCase } from '../usecase/create-message.usecase';
import { GetMessagesUseCase } from '../usecase/get-messages.usecase';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
  ) {}

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateMessageDto,
  ) {
    return this.createMessageUseCase.execute(req.user.userId, dto);
  }

  @Get(':applicationId')
  async getMessages(
    @Request() req: AuthenticatedRequest,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ) {
    return this.getMessagesUseCase.execute(applicationId, req.user.userId);
  }
}
