import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { GetCompaniesUseCase } from './use-cases/get-companies.use-case';
import { GetCompanyUseCase } from './use-cases/get-company.use-case';
import { CreateCompanyUseCase } from './use-cases/create-company.use-case';
import { UpdateCompanyUseCase } from './use-cases/update-company.use-case';
import { DeleteCompanyUseCase } from './use-cases/delete-company.use-case';
import { CompanyMapper } from './mappers/company.mapper';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompaniesUseCase: GetCompaniesUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase,
    private readonly companyMapper: CompanyMapper,
  ) {}

  @Get()
  async findAll(@Request() req: { user: JwtPayload }) {
    const companies = await this.getCompaniesUseCase.execute(req.user.sub);
    return this.companyMapper.toResponseList(companies);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: { user: JwtPayload }) {
    const company = await this.getCompanyUseCase.execute(id, req.user.sub);
    return this.companyMapper.toResponse(company);
  }

  @Post()
  async create(@Body() dto: CreateCompanyDto, @Request() req: { user: JwtPayload }) {
    const company = await this.createCompanyUseCase.execute(dto, req.user.sub);
    return this.companyMapper.toResponse(company);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCompanyDto, @Request() req: { user: JwtPayload }) {
    const company = await this.updateCompanyUseCase.execute(id, dto, req.user.sub);
    return this.companyMapper.toResponse(company);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: JwtPayload }) {
    await this.deleteCompanyUseCase.execute(id, req.user.sub);
    return { message: 'Company deleted successfully' };
  }
}
