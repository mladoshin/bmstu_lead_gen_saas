import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { BulkVerifyUseCase } from './use-cases/bulk-verify.use-case';
import { VerificationMapper } from './mappers/verification.mapper';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { BulkVerifyDto } from './dto/bulk-verify.dto';

@UseGuards(JwtAuthGuard)
@Controller('verification')
export class VerificationController {
  constructor(
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly bulkVerifyUseCase: BulkVerifyUseCase,
    private readonly verificationMapper: VerificationMapper,
  ) {}

  @Post('verify')
  async verify(@Body() dto: VerifyEmailDto) {
    const result = await this.verifyEmailUseCase.execute(dto);
    return this.verificationMapper.toResponse(result);
  }

  @Post('bulk')
  bulk(@Body() dto: BulkVerifyDto) {
    return this.bulkVerifyUseCase.execute(dto);
  }
}
