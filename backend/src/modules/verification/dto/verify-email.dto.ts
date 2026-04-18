import { IsUUID, IsEmail } from 'class-validator';

export class VerifyEmailDto {
  @IsUUID()
  contactId: string;

  @IsEmail()
  email: string;
}
