import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../repositories/user.repository';
import { UserProfile } from '../domain/user.entity';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResult {
  accessToken: string;
  user: UserProfile;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(input.password);
    const user = await this.userRepo.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    };
  }
}
