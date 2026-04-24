import { ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { RegisterUseCase } from './register.use-case';
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

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
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
    useCase = new RegisterUseCase(userRepo, jwtService as any);

    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user, hash password and return token with profile', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.create.mockResolvedValue(mockUser);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'plain-password',
      name: 'Test User',
    });

    expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(argon2.hash).toHaveBeenCalledWith('plain-password');
    expect(userRepo.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      name: 'Test User',
    });
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

  it('should throw ConflictException when user with email already exists', async () => {
    userRepo.findByEmail.mockResolvedValue(mockUser);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'plain-password',
        name: 'Test User',
      }),
    ).rejects.toThrow(ConflictException);

    expect(userRepo.create).not.toHaveBeenCalled();
  });

  it('should call jwtService.sign with sub and email', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.create.mockResolvedValue(mockUser);

    await useCase.execute({
      email: 'test@example.com',
      password: 'plain-password',
      name: 'Test User',
    });

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'test@example.com',
    });
  });

  it('should not return passwordHash in the result', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.create.mockResolvedValue(mockUser);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'plain-password',
      name: 'Test User',
    });

    expect(result.user).not.toHaveProperty('passwordHash');
  });
});
