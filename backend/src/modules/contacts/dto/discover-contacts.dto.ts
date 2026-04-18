import { IsUUID, IsArray, IsString } from 'class-validator';

export class DiscoverContactsDto {
  @IsUUID()
  selectionId: string;

  @IsArray()
  @IsString({ each: true })
  targetRoles: string[];
}
