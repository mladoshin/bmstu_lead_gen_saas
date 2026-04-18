import { Controller, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetSelectionsUseCase } from './use-cases/get-selections.use-case';
import { GetSelectionUseCase } from './use-cases/get-selection.use-case';
import { DeleteSelectionUseCase } from './use-cases/delete-selection.use-case';
import { SearchMapper } from './mappers/search.mapper';

@UseGuards(JwtAuthGuard)
@Controller('selections')
export class SelectionsController {
  constructor(
    private readonly getSelectionsUseCase: GetSelectionsUseCase,
    private readonly getSelectionUseCase: GetSelectionUseCase,
    private readonly deleteSelectionUseCase: DeleteSelectionUseCase,
    private readonly searchMapper: SearchMapper,
  ) {}

  @Get()
  async getSelections(@Request() req: any) {
    const selections = await this.getSelectionsUseCase.execute(req.user.sub);
    return this.searchMapper.toResponseList(selections);
  }

  @Get(':id')
  async getSelection(@Param('id') id: string, @Request() req: any) {
    const selection = await this.getSelectionUseCase.execute(id, req.user.sub);
    return this.searchMapper.toResponse(selection);
  }

  @Delete(':id')
  async deleteSelection(@Param('id') id: string, @Request() req: any) {
    await this.deleteSelectionUseCase.execute(id, req.user.sub);
    return { message: 'Selection deleted successfully' };
  }
}
