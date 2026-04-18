import { IsArray, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class SearchCompaniesDto {
  @IsArray()
  @IsString({ each: true })
  cities: string[];

  @IsString()
  industry: string;

  @IsInt()
  @Min(1)
  @Max(500)
  companyLimit: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRoles?: string[];
}
