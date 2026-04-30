import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

const BASE_COMPANIES = '/api/companies';
const BASE_SEARCH = '/api/search';

const VALID_USER = { email: 'user@test.com', password: 'password123', name: 'Test User' };
const OTHER_USER = { email: 'other@test.com', password: 'password123', name: 'Other User' };
const VALID_SEARCH_DTO = { cities: ['Москва'], industry: 'IT', companyLimit: 10 };

describe('Companies (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  async function register(body = VALID_USER): Promise<string> {
    const res = await request(app.getHttpServer()).post('/api/auth/register').send(body);
    return res.body.accessToken as string;
  }

  async function createSelection(token: string) {
    const res = await request(app.getHttpServer())
      .post(`${BASE_SEARCH}/companies`)
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_SEARCH_DTO);
    return res.body.id as string;
  }

  async function createCompany(token: string, selectionId: string) {
    return request(app.getHttpServer())
      .post(BASE_COMPANIES)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Corp', industry: 'IT', city: 'Москва', source: 'manual', selectionId });
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
    await prisma.company.deleteMany();
    await prisma.selection.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/companies', () => {
    it('200 + пустой массив при отсутствии компаний', async () => {
      const token = await register();
      const res = await request(app.getHttpServer())
        .get(BASE_COMPANIES)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('200 + только свои компании', async () => {
      const ownerToken = await register(VALID_USER);
      const otherToken = await register(OTHER_USER);

      const ownerSelectionId = await createSelection(ownerToken);
      const otherSelectionId = await createSelection(otherToken);

      await createCompany(ownerToken, ownerSelectionId);
      await createCompany(otherToken, otherSelectionId);

      const res = await request(app.getHttpServer())
        .get(BASE_COMPANIES)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer()).get(BASE_COMPANIES);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/companies', () => {
    it('201 + CompanyResponseDto при валидных данных', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const res = await createCompany(token, selectionId);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('name', 'Test Corp');
      expect(res.body).toHaveProperty('industry', 'IT');
      expect(res.body).toHaveProperty('city', 'Москва');
      expect(res.body).toHaveProperty('source', 'manual');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('400 при пустом name', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const res = await request(app.getHttpServer())
        .post(BASE_COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '', industry: 'IT', city: 'Москва', source: 'manual', selectionId });

      expect(res.status).toBe(400);
    });

    it('400 при невалидном selectionId (не UUID)', async () => {
      const token = await register();
      const res = await request(app.getHttpServer())
        .post(BASE_COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Corp',
          industry: 'IT',
          city: 'Москва',
          source: 'manual',
          selectionId: 'not-a-uuid',
        });

      expect(res.status).toBe(400);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer()).post(BASE_COMPANIES).send({
        name: 'Test Corp',
        industry: 'IT',
        city: 'Москва',
        source: 'manual',
        selectionId: '00000000-0000-0000-0000-000000000000',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/companies/:id', () => {
    it('200 + CompanyResponseDto для своей компании', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const createRes = await createCompany(token, selectionId);
      const companyId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .get(`${BASE_COMPANIES}/${companyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', companyId);
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('name', 'Test Corp');
      expect(res.body).toHaveProperty('industry', 'IT');
      expect(res.body).toHaveProperty('city', 'Москва');
      expect(res.body).toHaveProperty('source', 'manual');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('403 при попытке получить чужую компанию', async () => {
      const ownerToken = await register(VALID_USER);
      const attackerToken = await register(OTHER_USER);

      const selectionId = await createSelection(ownerToken);
      const createRes = await createCompany(ownerToken, selectionId);
      const companyId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .get(`${BASE_COMPANIES}/${companyId}`)
        .set('Authorization', `Bearer ${attackerToken}`);

      expect(res.status).toBe(403);
    });

    it('404 для несуществующего id', async () => {
      const token = await register();
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .get(`${BASE_COMPANIES}/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('401 без токена', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer()).get(`${BASE_COMPANIES}/${nonExistentId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/companies/:id', () => {
    it('200 + обновлённый CompanyResponseDto', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const createRes = await createCompany(token, selectionId);
      const companyId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .put(`${BASE_COMPANIES}/${companyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Corp' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', companyId);
      expect(res.body).toHaveProperty('name', 'Updated Corp');
    });

    it('403 при попытке обновить чужую компанию', async () => {
      const ownerToken = await register(VALID_USER);
      const attackerToken = await register(OTHER_USER);

      const selectionId = await createSelection(ownerToken);
      const createRes = await createCompany(ownerToken, selectionId);
      const companyId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .put(`${BASE_COMPANIES}/${companyId}`)
        .set('Authorization', `Bearer ${attackerToken}`)
        .send({ name: 'Hacked Corp' });

      expect(res.status).toBe(403);
    });

    it('404 для несуществующего id', async () => {
      const token = await register();
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .put(`${BASE_COMPANIES}/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Corp' });

      expect(res.status).toBe(404);
    });

    it('401 без токена', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .put(`${BASE_COMPANIES}/${nonExistentId}`)
        .send({ name: 'Updated Corp' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('200 + { message } при удалении своей компании', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const createRes = await createCompany(token, selectionId);
      const companyId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .delete(`${BASE_COMPANIES}/${companyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('403 при попытке удалить чужую компанию', async () => {
      const ownerToken = await register(VALID_USER);
      const attackerToken = await register(OTHER_USER);

      const selectionId = await createSelection(ownerToken);
      const createRes = await createCompany(ownerToken, selectionId);
      const companyId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .delete(`${BASE_COMPANIES}/${companyId}`)
        .set('Authorization', `Bearer ${attackerToken}`);

      expect(res.status).toBe(403);
    });

    it('404 для несуществующего id', async () => {
      const token = await register();
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .delete(`${BASE_COMPANIES}/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('401 без токена', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer()).delete(`${BASE_COMPANIES}/${nonExistentId}`);

      expect(res.status).toBe(401);
    });
  });
});
