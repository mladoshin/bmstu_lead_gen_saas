import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../repositories/user.repository';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.userRepo.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
