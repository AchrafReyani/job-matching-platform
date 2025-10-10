import { IsInt } from 'class-validator';

export class CreateApplicationDto {
  @IsInt()
  vacancyId: number;
}
