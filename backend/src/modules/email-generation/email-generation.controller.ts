import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateEmailsUseCase } from './use-cases/generate-emails.use-case';
import { GenerateEmailsDto } from './dto/generate-emails.dto';

@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailGenerationController {
  constructor(private readonly generateEmailsUseCase: GenerateEmailsUseCase) {}

  @Post('generate')
  generate(@Body() dto: GenerateEmailsDto) {
    return this.generateEmailsUseCase.execute(dto);
  }
}
