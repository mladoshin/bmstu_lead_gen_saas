import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

const VALID_USER = { email: 'flow@test.com', password: 'password123', name: 'Flow User' };
const OTHER_USER = { email: 'other@test.com', password: 'password123', name: 'Other User' };
const VALID_SEARCH_DTO = { cities: ['Москва', 'Санкт-Петербург'], industry: 'IT', companyLimit: 5 };

const CSV_HEADERS = 'id,name,industry,city,website,domain,phone,email_general,country,address,source';

describe('Full Flow: Register → Login → Search → Export (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  async function registerUser(body = VALID_USER) {
    return request(app.getHttpServer()).post('/api/auth/register').send(body);
  }

  async function loginUser(email: string, password: string) {
    return request(app.getHttpServer()).post('/api/auth/login').send({ email, password });
  }

  async function createSelection(token: string) {
    return request(app.getHttpServer())
      .post('/api/search/companies')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_SEARCH_DTO);
  }

  async function createCompany(token: string, selectionId: string, overrides: Record<string, unknown> = {}) {
    return request(app.getHttpServer())
      .post('/api/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        selectionId,
        name: 'Test Corp',
        industry: 'IT',
        city: 'Москва',
        source: 'manual',
        ...overrides,
      });
  }

  async function exportCsv(token: string, selectionId: string) {
    return request(app.getHttpServer())
      .get(`/api/export/companies/csv?selectionId=${selectionId}`)
      .set('Authorization', `Bearer ${token}`);
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
    await prisma.emailVerification.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.company.deleteMany();
    await prisma.selection.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('полный сценарий: регистрация → логин → поиск → добавление компаний → экспорт CSV', async () => {
    // 1. Регистрация
    const registerRes = await registerUser();
    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('accessToken');
    expect(typeof registerRes.body.accessToken).toBe('string');
    expect(registerRes.body.user).toHaveProperty('id');
    expect(registerRes.body.user).toHaveProperty('email', VALID_USER.email);
    expect(registerRes.body.user).toHaveProperty('name', VALID_USER.name);
    expect(registerRes.body.user).toHaveProperty('createdAt');
    expect(registerRes.body.user).not.toHaveProperty('passwordHash');

    // 2. Логин
    const loginRes = await loginUser(VALID_USER.email, VALID_USER.password);
    expect(loginRes.status).toBe(201);
    expect(loginRes.body).toHaveProperty('accessToken');
    expect(typeof loginRes.body.accessToken).toBe('string');
    const token = loginRes.body.accessToken;

    // 3. Поиск компаний (создание selection)
    const searchRes = await createSelection(token);
    expect(searchRes.status).toBe(201);
    expect(searchRes.body).toHaveProperty('id');
    expect(searchRes.body).toHaveProperty('userId');
    expect(searchRes.body).toHaveProperty('industry', VALID_SEARCH_DTO.industry);
    expect(searchRes.body).toHaveProperty('companyLimit', VALID_SEARCH_DTO.companyLimit);
    expect(searchRes.body).toHaveProperty('status', 'in_progress');
    const selectionId = searchRes.body.id;

    // 4. Добавление компаний
    const companyARes = await createCompany(token, selectionId, {
      name: 'Alpha Corp',
      industry: 'IT',
      city: 'Москва',
      source: 'manual',
      website: 'https://alpha.com',
      domain: 'alpha.com',
      phone: '+7-495-111-1111',
      emailGeneral: 'info@alpha.com',
      country: 'Россия',
      address: 'ул. Тверская, 1',
    });
    expect(companyARes.status).toBe(201);
    expect(companyARes.body).toHaveProperty('id');

    const companyBRes = await createCompany(token, selectionId, {
      name: 'Beta LLC',
      industry: 'IT',
      city: 'Санкт-Петербург',
      source: 'google_maps',
      website: 'https://beta.ru',
      domain: 'beta.ru',
      phone: '+7-812-222-2222',
    });
    expect(companyBRes.status).toBe(201);
    expect(companyBRes.body).toHaveProperty('id');

    // 5. Экспорт CSV
    const csvRes = await exportCsv(token, selectionId);
    expect(csvRes.status).toBe(200);
    expect(csvRes.headers['content-type']).toContain('text/csv');
    expect(csvRes.headers['content-disposition']).toContain(`companies-${selectionId}.csv`);

    const lines = csvRes.text.split('\n');
    expect(lines[0]).toBe(CSV_HEADERS);
    expect(lines.length).toBe(3); // header + 2 data rows

    // Проверяем, что обе компании присутствуют в CSV
    const csvContent = csvRes.text;
    expect(csvContent).toContain('"Alpha Corp"');
    expect(csvContent).toContain('"Beta LLC"');
    expect(csvContent).toContain('"info@alpha.com"');
    expect(csvContent).toContain('"Россия"');
    expect(csvContent).toContain('"ул. Тверская, 1"');

    // 6. Проверка статуса selection в БД
    const selection = await prisma.selection.findUnique({ where: { id: selectionId } });
    expect(selection).not.toBeNull();
    expect(selection!.status).toBe('completed');
  });

  it('403 при экспорте чужого selection', async () => {
    // User A создаёт selection
    const userARes = await registerUser(VALID_USER);
    const tokenA = userARes.body.accessToken;
    const selectionRes = await createSelection(tokenA);
    const selectionId = selectionRes.body.id;

    // User B пытается экспортировать
    const userBRes = await registerUser(OTHER_USER);
    const tokenB = userBRes.body.accessToken;

    const csvRes = await exportCsv(tokenB, selectionId);
    expect(csvRes.status).toBe(403);
  });

  it('404 при экспорте несуществующего selection', async () => {
    const registerRes = await registerUser();
    const token = registerRes.body.accessToken;

    const csvRes = await exportCsv(token, '00000000-0000-0000-0000-000000000000');
    expect(csvRes.status).toBe(404);
  });

  it('401 без Authorization header', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/export/companies/csv?selectionId=00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(401);
  });

  it('400 при невалидном selectionId (не UUID)', async () => {
    const registerRes = await registerUser();
    const token = registerRes.body.accessToken;

    const res = await request(app.getHttpServer())
      .get('/api/export/companies/csv?selectionId=not-a-uuid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('пустой selection — CSV содержит только заголовки', async () => {
    const registerRes = await registerUser();
    const token = registerRes.body.accessToken;
    const selectionRes = await createSelection(token);
    const selectionId = selectionRes.body.id;

    const csvRes = await exportCsv(token, selectionId);
    expect(csvRes.status).toBe(200);

    const lines = csvRes.text.split('\n');
    expect(lines[0]).toBe(CSV_HEADERS);
    expect(lines.length).toBe(1); // только заголовки

    const selection = await prisma.selection.findUnique({ where: { id: selectionId } });
    expect(selection!.status).toBe('completed');
  });

  it('CSV корректно экранирует кавычки в данных', async () => {
    const registerRes = await registerUser();
    const token = registerRes.body.accessToken;
    const selectionRes = await createSelection(token);
    const selectionId = selectionRes.body.id;

    await createCompany(token, selectionId, {
      name: 'Company "Test" Ltd',
      industry: 'IT',
      city: 'Москва',
      source: 'manual',
    });

    const csvRes = await exportCsv(token, selectionId);
    expect(csvRes.status).toBe(200);

    const lines = csvRes.text.split('\n');
    expect(lines.length).toBe(2); // header + 1 row
    expect(lines[1]).toContain('"Company ""Test"" Ltd"');
  });
});
