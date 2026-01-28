import { IsString, Equals } from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  password!: string;

  @IsString()
  @Equals('DELETE', { message: 'Confirmation must be exactly "DELETE"' })
  confirmation!: string;
}
