import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY_TOKEN, UserEntity } from '../repositories/user.repository';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
