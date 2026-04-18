import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCompanyDto {
  @IsUUID()
  selectionId: string;

  @IsString()
  name: string;

  @IsString()
  industry: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  emailGeneral?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  source: string;
}
