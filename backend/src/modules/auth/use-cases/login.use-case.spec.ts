import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '../repositories/user.repository';
import { UserEntity } from '../domain/user.entity';

jest.mock('argon2');

const makeUserRepo = (): jest.Mocked<IUserRepository> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
});

const makeJwtService = () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
});

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepo: jest.Mocked<IUserRepository>;
  let jwtService: ReturnType<typeof makeJwtService>;

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
    jwtService = makeJwtService();
    useCase = new LoginUseCase(userRepo, jwtService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully and return token with profile', async () => {
    userRepo.findByEmail.mockResolvedValue(mockUser);
    (argon2.verify as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'plain-password',
    });

    expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(argon2.verify).toHaveBeenCalledWith('hashed-password', 'plain-password');
    expect(result).toEqual({
      accessToken: 'mock-token',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: now,
      },
    });
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'nonexistent@example.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(argon2.verify).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password is wrong', async () => {
    userRepo.findByEmail.mockResolvedValue(mockUser);
    (argon2.verify as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should call jwtService.sign with sub and email', async () => {
    userRepo.findByEmail.mockResolvedValue(mockUser);
    (argon2.verify as jest.Mock).mockResolvedValue(true);

    await useCase.execute({
      email: 'test@example.com',
      password: 'plain-password',
    });

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'test@example.com',
    });
  });
});
