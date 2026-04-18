import { IsUUID } from 'class-validator';

export class ExportQueryDto {
  @IsUUID()
  selectionId: string;
}
