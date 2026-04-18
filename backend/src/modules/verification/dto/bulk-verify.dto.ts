import { IsUUID } from 'class-validator';

export class BulkVerifyDto {
  @IsUUID()
  selectionId: string;
}
