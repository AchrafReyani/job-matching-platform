import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateMessageDto) {
    return this.messagesService.createMessage(req.user.userId, req.user.role, dto);
  }

  @Get(':applicationId')
  async getMessages(@Request() req, @Param('applicationId') applicationId: string) {
    return this.messagesService.getMessages(Number(applicationId), req.user.userId);
  }
}
