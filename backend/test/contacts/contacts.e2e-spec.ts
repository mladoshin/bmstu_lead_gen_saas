import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { SEARCH_JOB_SERVICE_TOKEN } from '../../src/modules/search/services/search-job.service';
import {
  CONTACT_DISCOVERY_SERVICE_TOKEN,
  IContactDiscoveryService,
  DiscoveredContact,
} from '../../src/modules/contacts/services/contact-discovery.service';

const BASE_CONTACTS = '/api/contacts';
const BASE_SEARCH = '/api/search';
const BASE_COMPANIES = '/api/companies';

const VALID_USER = { email: 'user@test.com', password: 'password123', name: 'Test User' };
const OTHER_USER = { email: 'other@test.com', password: 'password123', name: 'Other User' };
const VALID_SEARCH_DTO = { cities: ['Москва'], industry: 'IT', companyLimit: 10 };

const MOCK_DISCOVERED_CONTACTS: DiscoveredContact[] = [
  {
    firstName: 'Иван',
    lastName: 'Петров',
    position: 'CEO',
    seniority: 'C-level',
    email: 'ivan@example.com',
    linkedin: 'https://linkedin.com/in/ivanpetrov',
    confidenceScore: 0.9,
  },
  {
    firstName: 'Мария',
    lastName: 'Сидорова',
    position: 'CTO',
    seniority: 'C-level',
    email: 'maria@example.com',
    confidenceScore: 0.85,
  },
];

const mockDiscoveryService: IContactDiscoveryService = {
  discoverContacts: jest.fn().mockResolvedValue(MOCK_DISCOVERED_CONTACTS),
};

describe('Contacts (e2e)', () => {
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
    const res = await request(app.getHttpServer())
      .post(BASE_COMPANIES)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Corp', industry: 'IT', city: 'Москва', source: 'manual', selectionId });
    return res.body;
  }

  async function createContact(
    token: string,
    companyId: string,
    overrides: Record<string, unknown> = {},
  ) {
    return request(app.getHttpServer())
      .post(BASE_CONTACTS)
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyId,
        firstName: 'Алексей',
        lastName: 'Иванов',
        position: 'Manager',
        source: 'manual',
        ...overrides,
      });
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CONTACT_DISCOVERY_SERVICE_TOKEN)
      .useValue(mockDiscoveryService)
      .overrideProvider(SEARCH_JOB_SERVICE_TOKEN)
      .useValue({ enqueue: () => {} })
      .compile();

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
    (mockDiscoveryService.discoverContacts as jest.Mock).mockClear();
    (mockDiscoveryService.discoverContacts as jest.Mock).mockResolvedValue(
      MOCK_DISCOVERED_CONTACTS,
    );
    await prisma.contact.deleteMany();
    await prisma.company.deleteMany();
    await prisma.selection.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── CRUD ──────────────────────────────────────────────

  describe('GET /api/contacts', () => {
    it('200 + пустой массив при отсутствии контактов', async () => {
      const token = await register();
      const res = await request(app.getHttpServer())
        .get(BASE_CONTACTS)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('200 + только свои контакты', async () => {
      const ownerToken = await register(VALID_USER);
      const otherToken = await register(OTHER_USER);

      const ownerSelectionId = await createSelection(ownerToken);
      const otherSelectionId = await createSelection(otherToken);

      const ownerCompany = await createCompany(ownerToken, ownerSelectionId);
      const otherCompany = await createCompany(otherToken, otherSelectionId);

      await createContact(ownerToken, ownerCompany.id);
      await createContact(otherToken, otherCompany.id);

      const res = await request(app.getHttpServer())
        .get(BASE_CONTACTS)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer()).get(BASE_CONTACTS);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/contacts', () => {
    it('201 + ContactResponseDto при валидных данных', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);

      const res = await createContact(token, company.id);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('companyId', company.id);
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('firstName', 'Алексей');
      expect(res.body).toHaveProperty('lastName', 'Иванов');
      expect(res.body).toHaveProperty('position', 'Manager');
      expect(res.body).toHaveProperty('source', 'manual');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('400 при невалидном companyId (не UUID)', async () => {
      const token = await register();
      const res = await request(app.getHttpServer())
        .post(BASE_CONTACTS)
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyId: 'not-a-uuid',
          firstName: 'Алексей',
          lastName: 'Иванов',
          position: 'Manager',
          source: 'manual',
        });

      expect(res.status).toBe(400);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer()).post(BASE_CONTACTS).send({
        companyId: '00000000-0000-0000-0000-000000000000',
        firstName: 'Алексей',
        lastName: 'Иванов',
        position: 'Manager',
        source: 'manual',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('200 + ContactResponseDto для существующего контакта', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      const createRes = await createContact(token, company.id);
      const contactId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .get(`${BASE_CONTACTS}/${contactId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', contactId);
      expect(res.body).toHaveProperty('firstName', 'Алексей');
      expect(res.body).toHaveProperty('lastName', 'Иванов');
    });

    it('404 для несуществующего id', async () => {
      const token = await register();
      const res = await request(app.getHttpServer())
        .get(`${BASE_CONTACTS}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer()).get(
        `${BASE_CONTACTS}/00000000-0000-0000-0000-000000000000`,
      );

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('200 + обновлённый контакт', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      const createRes = await createContact(token, company.id);
      const contactId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .put(`${BASE_CONTACTS}/${contactId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Обновлённый' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', contactId);
      expect(res.body).toHaveProperty('firstName', 'Обновлённый');
    });

    it('404 для несуществующего id', async () => {
      const token = await register();
      const res = await request(app.getHttpServer())
        .put(`${BASE_CONTACTS}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Обновлённый' });

      expect(res.status).toBe(404);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer())
        .put(`${BASE_CONTACTS}/00000000-0000-0000-0000-000000000000`)
        .send({ firstName: 'Хакер' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('200 + { message } при удалении контакта', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      const createRes = await createContact(token, company.id);
      const contactId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .delete(`${BASE_CONTACTS}/${contactId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('404 для несуществующего id', async () => {
      const token = await register();
      const res = await request(app.getHttpServer())
        .delete(`${BASE_CONTACTS}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer()).delete(
        `${BASE_CONTACTS}/00000000-0000-0000-0000-000000000000`,
      );

      expect(res.status).toBe(401);
    });
  });

  // ─── DISCOVER ──────────────────────────────────────────

  describe('POST /api/contacts/discover', () => {
    it('201 + массив найденных контактов при валидных данных', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      await createCompany(token, selectionId);

      const res = await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId, targetRoles: ['CEO', 'CTO'] });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);

      expect(res.body[0]).toHaveProperty('firstName', 'Иван');
      expect(res.body[0]).toHaveProperty('lastName', 'Петров');
      expect(res.body[0]).toHaveProperty('position', 'CEO');
      expect(res.body[0]).toHaveProperty('seniority', 'C-level');
      expect(res.body[0]).toHaveProperty('email', 'ivan@example.com');
      expect(res.body[0]).toHaveProperty('source', 'openai_web_search');
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('companyId');
      expect(res.body[0]).toHaveProperty('userId');
      expect(res.body[0]).toHaveProperty('createdAt');

      expect(res.body[1]).toHaveProperty('firstName', 'Мария');
      expect(res.body[1]).toHaveProperty('lastName', 'Сидорова');
      expect(res.body[1]).toHaveProperty('position', 'CTO');
    });

    it('201 + пустой массив при отсутствии компаний для selectionId', async () => {
      const token = await register();
      const nonExistentSelectionId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId: nonExistentSelectionId, targetRoles: ['CEO'] });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('дедупликация: повторный вызов не создаёт дублей', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      await createCompany(token, selectionId);

      const body = { selectionId, targetRoles: ['CEO', 'CTO'] };

      const res1 = await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .set('Authorization', `Bearer ${token}`)
        .send(body);

      expect(res1.status).toBe(201);
      expect(res1.body).toHaveLength(2);

      const res2 = await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .set('Authorization', `Bearer ${token}`)
        .send(body);

      expect(res2.status).toBe(201);
      expect(res2.body).toHaveLength(0);

      const allContacts = await request(app.getHttpServer())
        .get(BASE_CONTACTS)
        .set('Authorization', `Bearer ${token}`);

      expect(allContacts.body).toHaveLength(2);
    });

    it('201 + пустой массив если discovery сервис вернул пустой результат', async () => {
      (mockDiscoveryService.discoverContacts as jest.Mock).mockResolvedValueOnce([]);

      const token = await register();
      const selectionId = await createSelection(token);
      await createCompany(token, selectionId);

      const res = await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId, targetRoles: ['CEO'] });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('201 + пустой массив при ошибке discovery сервиса (graceful degradation)', async () => {
      (mockDiscoveryService.discoverContacts as jest.Mock).mockRejectedValueOnce(
        new Error('OpenAI API error'),
      );

      const token = await register();
      const selectionId = await createSelection(token);
      await createCompany(token, selectionId);

      const res = await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId, targetRoles: ['CEO'] });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('discoverContacts вызывается с правильными параметрами компании', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      await createCompany(token, selectionId);

      await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId, targetRoles: ['CEO', 'CTO'] });

      expect(mockDiscoveryService.discoverContacts).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Corp',
          city: 'Москва',
          industry: 'IT',
        }),
        ['CEO', 'CTO'],
      );
    });

    it('201 + пустой массив при попытке discover по чужому selectionId (ownership)', async () => {
      const ownerToken = await register(VALID_USER);
      const attackerToken = await register(OTHER_USER);

      const selectionId = await createSelection(ownerToken);
      await createCompany(ownerToken, selectionId);

      const res = await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .set('Authorization', `Bearer ${attackerToken}`)
        .send({ selectionId, targetRoles: ['CEO', 'CTO'] });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('400 при невалидном selectionId (не UUID)', async () => {
      const token = await register();
      const res = await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId: 'not-a-uuid', targetRoles: ['CEO'] });

      expect(res.status).toBe(400);
    });

    it('400 при отсутствии targetRoles', async () => {
      const token = await register();
      const res = await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(400);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE_CONTACTS}/discover`)
        .send({ selectionId: '00000000-0000-0000-0000-000000000000', targetRoles: ['CEO'] });

      expect(res.status).toBe(401);
    });
  });
});
