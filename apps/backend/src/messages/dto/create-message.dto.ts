import { IsString, IsInt, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  applicationId: number;

  @IsString()
  @MinLength(1)
  messageText: string;
}
