import { Injectable } from '@nestjs/common';
import { UserEntity } from '../repositories/user.repository';

@Injectable()
export class AuthMapper {
  toProfile(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
