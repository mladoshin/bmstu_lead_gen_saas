import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchCompaniesUseCase } from './use-cases/search-companies.use-case';
import { GetSelectionsUseCase } from './use-cases/get-selections.use-case';
import { GetSelectionUseCase } from './use-cases/get-selection.use-case';
import { DeleteSelectionUseCase } from './use-cases/delete-selection.use-case';
import { SearchMapper } from './mappers/search.mapper';
import { SearchCompaniesDto } from './dto/search-companies.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class SearchController {
  constructor(
    private readonly searchCompaniesUseCase: SearchCompaniesUseCase,
    private readonly getSelectionsUseCase: GetSelectionsUseCase,
    private readonly getSelectionUseCase: GetSelectionUseCase,
    private readonly deleteSelectionUseCase: DeleteSelectionUseCase,
    private readonly searchMapper: SearchMapper,
  ) {}

  @Post('search/companies')
  async searchCompanies(@Body() dto: SearchCompaniesDto, @Request() req: any) {
    const selection = await this.searchCompaniesUseCase.execute(dto, req.user.sub);
    return this.searchMapper.toResponse(selection);
  }

  @Get('selections')
  async getSelections(@Request() req: any) {
    const selections = await this.getSelectionsUseCase.execute(req.user.sub);
    return this.searchMapper.toResponseList(selections);
  }

  @Get('selections/:id')
  async getSelection(@Param('id') id: string) {
    const selection = await this.getSelectionUseCase.execute(id);
    return this.searchMapper.toResponse(selection);
  }

  @Delete('selections/:id')
  async deleteSelection(@Param('id') id: string) {
    await this.deleteSelectionUseCase.execute(id);
    return { message: 'Selection deleted successfully' };
  }
}
