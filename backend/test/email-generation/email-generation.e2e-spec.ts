import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  IEmailGenerationService,
  EMAIL_GENERATION_SERVICE_TOKEN,
} from '../../src/modules/email-generation/services/email-generation.service';
import {
  IContactDiscoveryService,
  CONTACT_DISCOVERY_SERVICE_TOKEN,
} from '../../src/modules/contacts/services/contact-discovery.service';

const BASE_EMAIL = '/api/email';
const BASE_SEARCH = '/api/search';
const BASE_COMPANIES = '/api/companies';
const BASE_CONTACTS = '/api/contacts';

const VALID_USER = { email: 'user@test.com', password: 'password123', name: 'Test User' };
const OTHER_USER = { email: 'other@test.com', password: 'password123', name: 'Other User' };
const VALID_SEARCH_DTO = { cities: ['Москва'], industry: 'IT', companyLimit: 10 };

const mockEmailGenerationService: IEmailGenerationService = {
  generateEmail: jest.fn().mockResolvedValue({
    email: 'aleksey.ivanov@testcorp.com',
    confidence: 0.85,
  }),
};

const mockDiscoveryService: IContactDiscoveryService = {
  discoverContacts: jest.fn().mockResolvedValue([]),
};

describe('Email Generation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  async function register(body = VALID_USER): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(body);
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
      .overrideProvider(EMAIL_GENERATION_SERVICE_TOKEN)
      .useValue(mockEmailGenerationService)
      .overrideProvider(CONTACT_DISCOVERY_SERVICE_TOKEN)
      .useValue(mockDiscoveryService)
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
    (mockEmailGenerationService.generateEmail as jest.Mock).mockClear();
    (mockEmailGenerationService.generateEmail as jest.Mock).mockResolvedValue({
      email: 'aleksey.ivanov@testcorp.com',
      confidence: 0.85,
    });
    await prisma.contact.deleteMany();
    await prisma.company.deleteMany();
    await prisma.selection.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/email/generate', () => {
    it('201 + генерация email для контактов без email', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      const contact = await createContact(token, company.id);

      const res = await request(app.getHttpServer())
        .post(`${BASE_EMAIL}/generate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 1);
      expect(res.body).toHaveProperty('updated', 1);
      expect(res.body).toHaveProperty('selectionId', selectionId);

      const updatedContact = await prisma.contact.findUnique({
        where: { id: contact.id },
      });
      expect(updatedContact?.email).toBe('aleksey.ivanov@testcorp.com');
    });

    it('пропускает контакты с существующим email', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      await createContact(token, company.id, { email: 'existing@test.com' });

      const res = await request(app.getHttpServer())
        .post(`${BASE_EMAIL}/generate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 0);
      expect(res.body).toHaveProperty('updated', 0);
    });

    it('обрабатывает несколько контактов', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      const contact1 = await createContact(token, company.id, {
        firstName: 'Иван',
        lastName: 'Петров',
      });
      const contact2 = await createContact(token, company.id, {
        firstName: 'Мария',
        lastName: 'Сидорова',
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE_EMAIL}/generate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 2);
      expect(res.body).toHaveProperty('updated', 2);

      const updated1 = await prisma.contact.findUnique({ where: { id: contact1.id } });
      const updated2 = await prisma.contact.findUnique({ where: { id: contact2.id } });
      expect(updated1?.email).toBe('aleksey.ivanov@testcorp.com');
      expect(updated2?.email).toBe('aleksey.ivanov@testcorp.com');
    });

    it('201 + {processed:1, updated:0} если сервис вернул null', async () => {
      (mockEmailGenerationService.generateEmail as jest.Mock).mockResolvedValueOnce(null);

      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId);
      await createContact(token, company.id);

      const res = await request(app.getHttpServer())
        .post(`${BASE_EMAIL}/generate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 1);
      expect(res.body).toHaveProperty('updated', 0);
    });

    it('generateEmail вызывается с правильными параметрами', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId, { domain: 'example.org' });
      await createContact(token, company.id, {
        firstName: 'Пётр',
        lastName: 'Смирнов',
      });

      await request(app.getHttpServer())
        .post(`${BASE_EMAIL}/generate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId });

      expect(mockEmailGenerationService.generateEmail).toHaveBeenCalledWith(
        { firstName: 'Пётр', lastName: 'Смирнов' },
        'example.org',
      );
    });

    it('извлекает домен из website, если domain отсутствует', async () => {
      const token = await register();
      const selectionId = await createSelection(token);
      const company = await createCompany(token, selectionId, {
        domain: undefined,
        website: 'https://example.com',
      });
      await createContact(token, company.id);

      await request(app.getHttpServer())
        .post(`${BASE_EMAIL}/generate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId });

      expect(mockEmailGenerationService.generateEmail).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Алексей', lastName: 'Иванов' }),
        'example.com',
      );
    });

    it('201 + пустой результат для несуществующего selectionId', async () => {
      const token = await register();
      const nonExistentSelectionId = '00000000-0000-0000-0000-000000000000';

      const res = await request(app.getHttpServer())
        .post(`${BASE_EMAIL}/generate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId: nonExistentSelectionId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 0);
      expect(res.body).toHaveProperty('updated', 0);
    });

    it('ownership: не обрабатывает чужие компании', async () => {
      const ownerToken = await register(VALID_USER);
      const attackerToken = await register(OTHER_USER);

      const selectionId = await createSelection(ownerToken);
      const company = await createCompany(ownerToken, selectionId);
      await createContact(ownerToken, company.id);

      const res = await request(app.getHttpServer())
        .post(`${BASE_EMAIL}/generate`)
        .set('Authorization', `Bearer ${attackerToken}`)
        .send({ selectionId });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('processed', 0);
      expect(res.body).toHaveProperty('updated', 0);
    });

    it('400 при невалидном selectionId (не UUID)', async () => {
      const token = await register();

      const res = await request(app.getHttpServer())
        .post(`${BASE_EMAIL}/generate`)
        .set('Authorization', `Bearer ${token}`)
        .send({ selectionId: 'not-a-uuid' });

      expect(res.status).toBe(400);
    });

    it('401 без токена', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE_EMAIL}/generate`)
        .send({ selectionId: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(401);
    });
  });
});
