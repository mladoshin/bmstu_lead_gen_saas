import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { BulkVerifyUseCase } from './use-cases/bulk-verify.use-case';
import { VerificationMapper } from './mappers/verification.mapper';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { BulkVerifyDto } from './dto/bulk-verify.dto';
import { ContactNotFoundError, ContactAccessDeniedError } from './domain/verification.errors';

@UseGuards(JwtAuthGuard)
@Controller('verification')
export class VerificationController {
  constructor(
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly bulkVerifyUseCase: BulkVerifyUseCase,
    private readonly verificationMapper: VerificationMapper,
  ) {}

  @Post('verify')
  async verify(
    @Body() dto: VerifyEmailDto,
    @Request() req: { user: JwtPayload },
  ) {
    try {
      const result = await this.verifyEmailUseCase.execute(dto, req.user.sub);
      return this.verificationMapper.toResponse(result);
    } catch (err) {
      if (err instanceof ContactNotFoundError) {
        throw new NotFoundException(err.message);
      }
      if (err instanceof ContactAccessDeniedError) {
        throw new ForbiddenException(err.message);
      }
      throw err;
    }
  }

  @Post('bulk')
  bulk(@Body() dto: BulkVerifyDto, @Request() req: { user: JwtPayload }) {
    return this.bulkVerifyUseCase.execute(dto, req.user.sub);
  }
}
