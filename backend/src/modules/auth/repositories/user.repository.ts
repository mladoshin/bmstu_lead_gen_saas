import { UserEntity, CreateUserData } from '../domain/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
}

export const USER_REPOSITORY_TOKEN = 'IUserRepository';
