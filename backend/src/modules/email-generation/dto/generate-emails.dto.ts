import { IsUUID } from 'class-validator';

export class GenerateEmailsDto {
  @IsUUID()
  selectionId: string;
}
