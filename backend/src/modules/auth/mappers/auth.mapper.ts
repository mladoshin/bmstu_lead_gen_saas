import { Injectable } from '@nestjs/common';
import { UserEntity, UserProfile } from '../domain/user.entity';

@Injectable()
export class AuthMapper {
  toProfile(user: UserEntity): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
