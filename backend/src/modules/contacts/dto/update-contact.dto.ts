import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  position?: string;

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
}
