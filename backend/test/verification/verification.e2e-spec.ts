import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  IEmailVerificationService,
  EMAIL_VERIFICATION_SERVICE_TOKEN,
} from '../../src/modules/verification/services/email-verification.service';
import {
  IContactDiscoveryService,
  CONTACT_DISCOVERY_SERVICE_TOKEN,
} from '../../src/modules/contacts/services/contact-discovery.service';
import {
  IEmailGenerationService,
  EMAIL_GENERATION_SERVICE_TOKEN,
} from '../../src/modules/email-generation/services/email-generation.service';

const BASE_VERIFICATION = '/api/verification';
const BASE_SEARCH = '/api/search';
const BASE_COMPANIES = '/api/companies';
const BASE_CONTACTS = '/api/contacts';

const VALID_USER = { email: 'user@test.com', password: 'password123', name: 'Test User' };
const OTHER_USER = { email: 'other@test.com', password: 'password123', name: 'Other User' };
const VALID_SEARCH_DTO = { cities: ['Москва'], industry: 'IT', companyLimit: 10 };

const mockEmailVerificationService: IEmailVerificationService = {
  verifyEmail: jest.fn().mockResolvedValue({
    isValid: true,
    mxFound: true,
    smtpCheck: true,
    catchAll: false,
    confidenceScore: 0.95,
  }),
};

const mockDiscoveryService: IContactDiscoveryService = {
  discoverContacts: jest.fn().mockResolvedValue([]),
};

const mockEmailGenService: IEmailGenerationService = {
  generateEmail: jest.fn().mockResolvedValue(null),
};

describe('Verification (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  async function register(body = VALID_USER): Promise<string> {
    const res = await request(app.getHttpServer()).post('/api/auth/register').send(body);
    return res.body.accessToken as string;
  }

  async function createSelection(token: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post(`${BASE_SEARCH}/companies`)
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_SEARCH_DTO);
    return res.body.id as string;
  }

  async function createCompany(
    token: string,
    selectionId: string,
    overrides: Record<string, unknown> = {},
  ) {
    const res = await request(app.getHttpServer())
      .post(BASE_COMPANIES)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Corp',
        industry: 'IT',
        city: 'Москва',
        source: 'manual',
        domain: 'testcorp.com',
        selectionId,
        ...overrides,
      });
    return res.body;
  }

  async function createContact(
    token: string,
    companyId: string,
    overrides: Record<string, unknown> = {},
  ) {
    const res = await request(app.getHttpServer())
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
    return res.body;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EMAIL_VERIFICATION_SERVICE_TOKEN)
      .useValue(mockEmailVerificationService)
      .overrideProvider(CONTACT_DISCOVERY_SERVICE_TOKEN)
      .useValue(mockDiscoveryService)
      .overrideProvider(EMAIL_GENERATION_SERVICE_TOKEN)
      .useValue(mockEmailGenService)
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
    (mockEmailVerificationService.verifyEmail as jest.Mock).mockClear();
    (mockEmailVerificationService.verifyEmail as jest.Mock).mockResolvedValue({
      isValid: true,
      mxFound: true,
      smtpCheck: true,
      catchAll: false,
      confidenceScore: 0.95,
    });
    await prisma.emailVerification.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.company.deleteMany();
    await prisma.selection.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/verification/verify', () => {
    it('201 + успешная верификация', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      const contact = await createContact(token, company.id, {
        email: 'test@testcorp.com',
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: contact.id, email: 'test@testcorp.com' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('isValid', true);
      expect(res.body).toHaveProperty('smtpCheck', true);
      expect(res.body).toHaveProperty('catchAll', false);
      expect(res.body).toHaveProperty('confidenceScore', 0.95);
    });

    it('201 + результат сохранён в БД', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      const contact = await createContact(token, company.id, {
        email: 'test@testcorp.com',
      });

      await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: contact.id, email: 'test@testcorp.com' });

      const record = await prisma.emailVerification.findUnique({
        where: { contactId: contact.id },
      });

      expect(record).not.toBeNull();
      expect(record!.email).toBe('test@testcorp.com');
      expect(record!.isValid).toBe(true);
      expect(record!.smtpCheck).toBe(true);
      expect(record!.catchAll).toBe(false);
      expect(record!.confidenceScore).toBe(0.95);
    });

    it('201 + повторная верификация обновляет запись (upsert)', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      const contact = await createContact(token, company.id, {
        email: 'test@testcorp.com',
      });

      await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: contact.id, email: 'test@testcorp.com' });

      await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: contact.id, email: 'test@testcorp.com' });

      const records = await prisma.emailVerification.findMany({
        where: { contactId: contact.id },
      });
      expect(records).toHaveLength(1);
    });

    it('verifyEmail вызван с правильным email-аргументом', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      const contact = await createContact(token, company.id, {
        email: 'specific@example.com',
      });

      await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: contact.id, email: 'specific@example.com' });

      expect(mockEmailVerificationService.verifyEmail).toHaveBeenCalledWith('specific@example.com');
    });

    it('404 при несуществующем contactId', async () => {
      const token = await register();

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          contactId: '00000000-0000-0000-0000-000000000000',
          email: 'test@test.com',
        });

      expect(res.status).toBe(404);
    });

    it('403 при попытке верификации чужого контакта', async () => {
      const ownerToken = await register(VALID_USER);
      const attackerToken = await register(OTHER_USER);

      const selectionId = await createSelection(ownerToken);
      const company = await createCompany(ownerToken, selectionId);
      const contact = await createContact(ownerToken, company.id, {
        email: 'test@testcorp.com',
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/verify`)
        .set('Authorization', `Bearer ${attackerToken}`)
        .send({ contactId: contact.id, email: 'test@testcorp.com' });

      expect(res.status).toBe(403);
    });

    it('400 невалидный contactId (не UUID)', async () => {
      const token = await register();

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: 'not-a-uuid', email: 'test@test.com' });

      expect(res.status).toBe(400);
    });

    it('400 невалидный email', async () => {
      const token = await register();

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/verify`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          contactId: '00000000-0000-0000-0000-000000000000',
          email: 'not-an-email',
        });

      expect(res.status).toBe(400);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer()).post(`${BASE_VERIFICATION}/verify`).send({
        contactId: '00000000-0000-0000-0000-000000000000',
        email: 'test@test.com',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/verification/bulk', () => {
    it('201 + bulk верификация нескольких контактов', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      await createContact(token, company.id, {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan@testcorp.com',
      });
      await createContact(token, company.id, {
        firstName: 'Мария',
        lastName: 'Сидорова',
        email: 'maria@testcorp.com',
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 2);
      expect(res.body).toHaveProperty('verified', 2);
    });

    it('201 + пропуск контактов без email', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      await createContact(token, company.id, {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan@testcorp.com',
      });
      await createContact(token, company.id, {
        firstName: 'Мария',
        lastName: 'Сидорова',
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 1);
      expect(res.body).toHaveProperty('verified', 1);
    });

    it('201 + ownership: чужие данные', async () => {
      const ownerToken = await register(VALID_USER);
      const attackerToken = await register(OTHER_USER);

      const selectionId = await createSelection(ownerToken);
      const company = await createCompany(ownerToken, selectionId);
      await createContact(ownerToken, company.id, {
        email: 'test@testcorp.com',
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/bulk`)
        .set('Authorization', `Bearer ${attackerToken}`)
        .send({ selectionId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 0);
      expect(res.body).toHaveProperty('verified', 0);
    });

    it('201 + несуществующий selectionId', async () => {
      const token = await register();

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 0);
      expect(res.body).toHaveProperty('verified', 0);
    });

    it('201 + verifyEmail возвращает isValid: false', async () => {
      (mockEmailVerificationService.verifyEmail as jest.Mock).mockResolvedValue({
        isValid: false,
        mxFound: true,
        smtpCheck: false,
        catchAll: false,
        confidenceScore: 0.0,
      });

      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      await createContact(token, company.id, {
        email: 'invalid@testcorp.com',
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 1);
      expect(res.body).toHaveProperty('verified', 0);
    });

    it('201 + результаты сохранены в БД после bulk', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      const contact = await createContact(token, company.id, {
        email: 'test@testcorp.com',
      });

      await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId });

      const record = await prisma.emailVerification.findUnique({
        where: { contactId: contact.id },
      });

      expect(record).not.toBeNull();
      expect(record!.isValid).toBe(true);
      expect(record!.smtpCheck).toBe(true);
      expect(record!.confidenceScore).toBe(0.95);
    });

    it('400 невалидный selectionId (не UUID)', async () => {
      const token = await register();

      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/bulk`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId: 'not-a-uuid' });

      expect(res.status).toBe(400);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE_VERIFICATION}/bulk`)
        .send({ selectionId: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(401);
    });
  });
});
