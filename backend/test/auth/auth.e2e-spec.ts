import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

const BASE = '/api/auth';
const VALID_USER = {
  email: 'user@test.com',
  password: 'password123',
  name: 'Test User',
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  async function register(body = VALID_USER) {
    return request(app.getHttpServer()).post(`${BASE}/register`).send(body);
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('201 + accessToken + user (без passwordHash)', async () => {
      const res = await register();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email', VALID_USER.email);
      expect(res.body.user).toHaveProperty('name', VALID_USER.name);
      expect(res.body.user).toHaveProperty('createdAt');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('409 при дублирующем email', async () => {
      await register();
      const res = await register();

      expect(res.status).toBe(409);
    });

    it('400 при name = "" (проверяет @IsNotEmpty)', async () => {
      const res = await register({ ...VALID_USER, name: '' });

      expect(res.status).toBe(400);
    });

    it('400 при невалидном email', async () => {
      const res = await register({ ...VALID_USER, email: 'not-an-email' });

      expect(res.status).toBe(400);
    });

    it('400 при пароле < 8 символов', async () => {
      const res = await register({ ...VALID_USER, password: 'short' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('201 + accessToken при верных кредах', async () => {
      await register();

      const res = await request(app.getHttpServer())
        .post(`${BASE}/login`)
        .send({ email: VALID_USER.email, password: VALID_USER.password });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('401 при неверном пароле', async () => {
      await register();

      const res = await request(app.getHttpServer())
        .post(`${BASE}/login`)
        .send({ email: VALID_USER.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('401 при несуществующем email', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/login`)
        .send({ email: 'nonexistent@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('200 + user profile (без passwordHash)', async () => {
      const registerRes = await register();
      const { accessToken } = registerRes.body;

      const res = await request(app.getHttpServer())
        .get(`${BASE}/me`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', VALID_USER.email);
      expect(res.body).toHaveProperty('name', VALID_USER.name);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('401 без Authorization header', async () => {
      const res = await request(app.getHttpServer()).get(`${BASE}/me`);

      expect(res.status).toBe(401);
    });

    it('401 с невалидным токеном', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/me`)
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
    });
  });
});
