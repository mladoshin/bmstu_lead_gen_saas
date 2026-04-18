import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class CreateContactDto {
  @IsUUID()
  companyId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  seniority?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsOptional()
  @IsNumber()
  confidenceScore?: number;

  @IsString()
  source: string;
}
