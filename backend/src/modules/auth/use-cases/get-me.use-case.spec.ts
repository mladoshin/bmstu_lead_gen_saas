import { NotFoundException } from '@nestjs/common';
import { GetMeUseCase } from './get-me.use-case';
import { IUserRepository } from '../repositories/user.repository';
import { UserEntity } from '../domain/user.entity';

const makeUserRepo = (): jest.Mocked<IUserRepository> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
});

describe('GetMeUseCase', () => {
  let useCase: GetMeUseCase;
  let userRepo: jest.Mocked<IUserRepository>;

  const now = new Date('2026-01-01T00:00:00Z');

  const mockUser: UserEntity = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    userRepo = makeUserRepo();
    useCase = new GetMeUseCase(userRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return UserProfile when user is found', async () => {
    userRepo.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute('user-1');

    expect(userRepo.findById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: now,
    });
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('updatedAt');
  });

  it('should throw NotFoundException when user is not found', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(NotFoundException);

    expect(userRepo.findById).toHaveBeenCalledWith('nonexistent-id');
  });
});
