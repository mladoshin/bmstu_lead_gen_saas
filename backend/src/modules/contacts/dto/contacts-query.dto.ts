import { IsOptional, IsUUID } from 'class-validator';

export class ContactsQueryDto {
  @IsOptional()
  @IsUUID()
  selectionId?: string;
}
