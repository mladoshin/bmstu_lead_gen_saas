import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

const BASE_SEARCH = '/api/search';
const BASE_SELECTIONS = '/api/selections';

const VALID_USER = { email: 'user@test.com', password: 'password123', name: 'Test User' };
const OTHER_USER = { email: 'other@test.com', password: 'password123', name: 'Other User' };
const VALID_SEARCH_DTO = { cities: ['Москва'], industry: 'IT', companyLimit: 10 };

describe('Selections (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  async function register(body = VALID_USER): Promise<string> {
    const res = await request(app.getHttpServer()).post('/api/auth/register').send(body);
    return res.body.accessToken as string;
  }

  async function createSelection(token: string, body = VALID_SEARCH_DTO) {
    return request(app.getHttpServer())
      .post(`${BASE_SEARCH}/companies`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
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
    await prisma.selection.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/search/companies', () => {
    it('201 + SelectionResponseDto при валидных данных', async () => {
      const token = await register();
      const res = await createSelection(token);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('industry', VALID_SEARCH_DTO.industry);
      expect(res.body).toHaveProperty('cities');
      expect(res.body).toHaveProperty('companyLimit', VALID_SEARCH_DTO.companyLimit);
      expect(res.body).toHaveProperty('status', 'in_progress');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE_SEARCH}/companies`)
        .send(VALID_SEARCH_DTO);

      expect(res.status).toBe(401);
    });

    it('400 при невалидных данных (companyLimit = 0)', async () => {
      const token = await register();
      const res = await createSelection(token, { ...VALID_SEARCH_DTO, companyLimit: 0 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/selections', () => {
    it('200 + пустой массив если нет выборок', async () => {
      const token = await register();
      const res = await request(app.getHttpServer())
        .get(BASE_SELECTIONS)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('200 + массив только своих выборок (не чужих)', async () => {
      const ownerToken = await register(VALID_USER);
      const otherToken = await register(OTHER_USER);

      await createSelection(ownerToken);
      await createSelection(otherToken);

      const res = await request(app.getHttpServer())
        .get(BASE_SELECTIONS)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer()).get(BASE_SELECTIONS);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/selections/:id', () => {
    it('200 + SelectionResponseDto для своей выборки', async () => {
      const token = await register();
      const createRes = await createSelection(token);
      const selectionId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .get(`${BASE_SELECTIONS}/${selectionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', selectionId);
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('industry', VALID_SEARCH_DTO.industry);
      expect(res.body).toHaveProperty('cities');
      expect(res.body).toHaveProperty('companyLimit', VALID_SEARCH_DTO.companyLimit);
      expect(res.body).toHaveProperty('status', 'in_progress');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('403 при попытке получить чужую выборку', async () => {
      const ownerToken = await register(VALID_USER);
      const attackerToken = await register(OTHER_USER);

      const createRes = await createSelection(ownerToken);
      const selectionId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .get(`${BASE_SELECTIONS}/${selectionId}`)
        .set('Authorization', `Bearer ${attackerToken}`);

      expect(res.status).toBe(403);
    });

    it('404 для несуществующего ID', async () => {
      const token = await register();
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .get(`${BASE_SELECTIONS}/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('401 без токена', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer()).get(`${BASE_SELECTIONS}/${nonExistentId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/selections/:id', () => {
    it('200 + { message } при удалении своей выборки', async () => {
      const token = await register();
      const createRes = await createSelection(token);
      const selectionId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .delete(`${BASE_SELECTIONS}/${selectionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('403 при попытке удалить чужую выборку', async () => {
      const ownerToken = await register(VALID_USER);
      const attackerToken = await register(OTHER_USER);

      const createRes = await createSelection(ownerToken);
      const selectionId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .delete(`${BASE_SELECTIONS}/${selectionId}`)
        .set('Authorization', `Bearer ${attackerToken}`);

      expect(res.status).toBe(403);
    });

    it('404 для несуществующего ID', async () => {
      const token = await register();
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .delete(`${BASE_SELECTIONS}/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('401 без токена', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer()).delete(`${BASE_SELECTIONS}/${nonExistentId}`);

      expect(res.status).toBe(401);
    });
  });
});
