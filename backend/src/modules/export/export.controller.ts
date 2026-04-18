import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportCompaniesUseCase } from './use-cases/export-companies.use-case';
import { ExportContactsUseCase } from './use-cases/export-contacts.use-case';
import { ExportQueryDto } from './dto/export-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(
    private readonly exportCompaniesUseCase: ExportCompaniesUseCase,
    private readonly exportContactsUseCase: ExportContactsUseCase,
  ) {}

  @Get('companies/csv')
  async exportCompanies(@Query() query: ExportQueryDto, @Res() res: Response) {
    const csv = await this.exportCompaniesUseCase.execute(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="companies-${query.selectionId}.csv"`);
    res.send(csv);
  }

  @Get('contacts/csv')
  async exportContacts(@Query() query: ExportQueryDto, @Res() res: Response) {
    const csv = await this.exportContactsUseCase.execute(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="contacts-${query.selectionId}.csv"`);
    res.send(csv);
  }
}
