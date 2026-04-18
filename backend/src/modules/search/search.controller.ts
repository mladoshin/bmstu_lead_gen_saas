import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchCompaniesUseCase } from './use-cases/search-companies.use-case';
import { SearchMapper } from './mappers/search.mapper';
import { SearchCompaniesDto } from './dto/search-companies.dto';

@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchCompaniesUseCase: SearchCompaniesUseCase,
    private readonly searchMapper: SearchMapper,
  ) {}

  @Post('companies')
  async searchCompanies(@Body() dto: SearchCompaniesDto, @Request() req: any) {
    const selection = await this.searchCompaniesUseCase.execute(dto, req.user.sub);
    return this.searchMapper.toResponse(selection);
  }
}
