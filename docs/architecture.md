# Архитектура

## Общая схема

```
                              ┌──────────────────┐
                              │  Google Maps API  │
                              └────────┬─────────┘
┌─────────────┐     ┌──────────────┐   │   ┌──────────────┐
│  Frontend   │────▶│   Backend    │───┼──▶│  OpenAI API  │
│  React SPA  │◀────│   NestJS     │   │   └──────────────┘
└─────────────┘     └──────┬───────┘   │   ┌──────────────┐
                           │           └──▶│  Grok AI API │
                    ┌──────▼───────┐       └──────────────┘
                    │  PostgreSQL  │
                    │   (Prisma)   │
                    └──────────────┘
```

## Структура монорепозитория

```
bmstu_lead_gen_saas/
├── backend/           # NestJS API сервер
│   ├── src/
│   │   ├── modules/   # Модули (companies, contacts, auth, search, email-generation, verification, export)
│   │   ├── prisma/    # Схема и миграции БД
│   │   └── main.ts
│   ├── test/
│   └── package.json
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/  # API-клиент
│   │   └── App.tsx
│   └── package.json
├── docs/
├── turbo.json
└── package.json
```

## Основные модули бэкенда

| Модуль | Ответственность |
|--------|----------------|
| `auth` | Регистрация, авторизация, JWT |
| `companies` | CRUD компаний |
| `contacts` | CRUD контактов ЛПР |
| `search` | Поиск компаний через множество источников (Google Maps, OpenAI, Grok AI), извлечение доменов |
| `email-generation` | Генерация email по паттернам (firstname@domain, f.lastname@domain и т.д.) |
| `verification` | Верификация email: MX check, SMTP handshake, catch-all detection |
| `export` | Экспорт компаний и контактов в CSV по выборке |

## Взаимодействие

- Frontend общается с Backend через REST API
- Backend использует Prisma ORM для работы с PostgreSQL
- Поиск компаний осуществляется через pipeline из 5 этапов с использованием Google Maps/Places API, OpenAI API и Grok AI API
- Для классификации должностей и поиска контактов ЛПР используются AI-модели (OpenAI, Grok AI)
- Аутентификация через JWT-токены

## Архитектура бэкенда (Clean Architecture)

Бэкенд построен по принципам Clean Architecture. Каждый модуль содержит следующие слои:

| Слой | Ответственность |
|------|----------------|
| **Controller** | Принимает HTTP-запросы, валидирует входные данные через DTO, вызывает use case, возвращает ответ |
| **Use Case** | Бизнес-логика и оркестрация. Не зависит от фреймворка, работает только через абстракции |
| **Repository (интерфейс)** | Абстракция доступа к данным. Определяет контракт без привязки к ORM |
| **Prisma Repository** | Конкретная реализация repository через Prisma ORM |
| **Mappers** | Маппинг между слоями: Entity ↔ DTO, Prisma Model ↔ Entity, маппинг ошибок |

### Пример структуры модуля (companies)

```
modules/companies/
├── companies.controller.ts
├── companies.module.ts
├── use-cases/
│   ├── create-company.use-case.ts
│   ├── get-companies.use-case.ts
│   └── search-companies.use-case.ts
├── repositories/
│   ├── company.repository.ts          # интерфейс
│   └── prisma-company.repository.ts   # реализация
├── mappers/
│   ├── company.mapper.ts              # Entity ↔ DTO
│   └── company-error.mapper.ts        # ошибки
└── dto/
    ├── create-company.dto.ts          # name, industry, city, website, phone, domain, source...
    └── company-response.dto.ts
```

## Архитектура фронтенда (Clean Architecture + SOLID)

UI-шаблон: Isomorphic React template. Каждый слой зависит от абстракций, не от конкретных реализаций (Dependency Inversion Principle).

### 5 модулей

| Модуль | Роль | Реализация |
|--------|------|------------|
| **Main** | Точка входа, DI-контейнер, композиция модулей | Vite entry point |
| **Core** | Вся бизнес-логика, use cases, entities, интерфейсы | Чистый TypeScript, без зависимостей от фреймворков |
| **API** | Абстракция доступа к серверу (интерфейсы) | Axios (конкретная реализация) |
| **Store** | Абстракция управления состоянием (интерфейсы) | Zustand (конкретная реализация) |
| **UI** | Абстракция представления (интерфейсы) | React (конкретная реализация) |

### Структура src/

```
src/
├── main/                   # Точка входа, инициализация, DI
├── core/                   # Бизнес-логика (entities, use cases, interfaces)
│   ├── entities/           # Доменные модели
│   ├── use-cases/          # Сценарии использования
│   └── interfaces/         # Абстракции (IApiClient, IStore, IAuthService...)
├── api/                    # Реализация API-слоя
│   ├── client.ts           # Axios-клиент
│   └── services/           # Реализации интерфейсов из core
├── store/                  # Реализация стейт-менеджмента
│   └── slices/             # Zustand-сторы, реализующие интерфейсы из core
└── ui/                     # Реализация представления
    ├── components/         # React-компоненты
    ├── pages/              # Страницы
    ├── layouts/            # Лейауты
    └── hooks/              # React-хуки
```

Core не импортирует ни React, ни Axios, ни Zustand — только чистый TypeScript. Формы реализованы через React Hook Form + Zod (в ui/ слое).

## Соблюдение SOLID

### Бэкенд

| Принцип | Как соблюдается |
|---------|----------------|
| **S** (Single Responsibility) | Controller — только HTTP, Use Case — только бизнес-логика, Repository — только доступ к данным, Mapper — только преобразование |
| **O** (Open/Closed) | Новые use cases добавляются без изменения существующих. Новые источники данных — через новую реализацию repository |
| **L** (Liskov Substitution) | PrismaCompanyRepository заменяет CompanyRepository (интерфейс) без изменения поведения use case |
| **I** (Interface Segregation) | Отдельные интерфейсы для каждого репозитория (ICompanyRepository, IContactRepository...), а не один общий IRepository |
| **D** (Dependency Inversion) | Use Case зависит от ICompanyRepository (абстракция), а не от PrismaCompanyRepository. Инъекция через NestJS DI |

### Фронтенд

| Принцип | Как соблюдается |
|---------|----------------|
| **S** (Single Responsibility) | Core — бизнес-логика, API — сетевые запросы, Store — состояние, UI — отображение |
| **O** (Open/Closed) | Новые фичи добавляются через новые use cases в core/ и компоненты в ui/, не трогая существующие |
| **L** (Liskov Substitution) | Axios-реализация заменяема на fetch — главное соответствие IApiClient. Zustand заменяем на любой стейт-менеджер через IStore |
| **I** (Interface Segregation) | Отдельные интерфейсы: ICompanyApi, IContactApi, IAuthApi, ISelectionApi, IEmailGenerationApi, IExportApi — не один гигантский IApi |
| **D** (Dependency Inversion) | Core определяет интерфейсы (IApiClient, IAuthStore...), api/ и store/ реализуют их. Core не знает про Axios/Zustand/React |

## API эндпоинты

Все эндпоинты доступны по префиксу `/api`. Авторизация через JWT-токен в заголовке `Authorization: Bearer <token>`.

### Auth

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация нового пользователя |
| POST | `/api/auth/login` | Авторизация, получение JWT-токена |
| GET | `/api/auth/me` | Получение профиля текущего пользователя |

### Selections (выборки)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/selections` | Список выборок пользователя |
| GET | `/api/selections/:id` | Получение выборки по ID |
| DELETE | `/api/selections/:id` | Удаление выборки |

### Search (поиск компаний)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/search/companies` | Запуск поиска компаний (вход: cities[], industry, company_limit). Создаёт Selection |

### Companies

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/companies` | Список компаний пользователя |
| GET | `/api/companies/:id` | Получение компании по ID |
| POST | `/api/companies` | Создание компании вручную |
| PUT | `/api/companies/:id` | Обновление компании |
| DELETE | `/api/companies/:id` | Удаление компании |

### Contacts (поиск ЛПР)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/contacts` | Список контактов пользователя |
| GET | `/api/contacts/:id` | Получение контакта по ID |
| POST | `/api/contacts` | Создание контакта вручную |
| PUT | `/api/contacts/:id` | Обновление контакта |
| DELETE | `/api/contacts/:id` | Удаление контакта |
| POST | `/api/contacts/discover` | Поиск контактов/ЛПР (вход: selectionId, target_roles[]) |

### Email Generation (генерация email)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/email/generate` | Генерация email по паттернам для контактов выборки (вход: selectionId) |

### Verification (верификация email)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/verification/verify` | Верификация email-адреса контакта |
| POST | `/api/verification/bulk` | Массовая верификация email-адресов |

### Export (экспорт)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/export/companies/csv` | Экспорт компаний в CSV (query: selectionId) |
| GET | `/api/export/contacts/csv` | Экспорт контактов в CSV (query: selectionId) |

## Схема базы данных

### User

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID (PK) | Уникальный идентификатор |
| email | VARCHAR, UNIQUE | Email пользователя |
| password_hash | VARCHAR | Хэш пароля (argon2) |
| name | VARCHAR | Имя пользователя |
| created_at | TIMESTAMP | Дата регистрации |
| updated_at | TIMESTAMP | Дата последнего обновления |

### Selection (выборка)

Каждый запуск pipeline автоматически сохраняется как выборка, к которой пользователь может вернуться.

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID (PK) | Уникальный идентификатор |
| user_id | UUID (FK → User) | Владелец выборки |
| name | VARCHAR | Автоматическое имя: "{industry} — {cities}" |
| industry | VARCHAR | Отрасль поиска |
| cities | JSON | Массив городов поиска |
| company_limit | INTEGER | Лимит компаний на поиск |
| target_roles | JSON | Массив целевых ролей ЛПР |
| status | ENUM (pending, in_progress, completed, failed) | Статус выборки |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата последнего обновления |

### Company

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID (PK) | Уникальный идентификатор |
| selection_id | UUID (FK → Selection) | Выборка, в которой найдена компания |
| user_id | UUID (FK → User) | Владелец |
| name | VARCHAR | Название компании |
| industry | VARCHAR | Отрасль |
| city | VARCHAR | Город |
| website | VARCHAR, NULL | Сайт |
| domain | VARCHAR, NULL | Домен (извлекается из website) |
| phone | VARCHAR, NULL | Телефон |
| email_general | VARCHAR, NULL | Общий email компании |
| country | VARCHAR, NULL | Страна |
| address | VARCHAR, NULL | Адрес |
| source | VARCHAR | Источник данных (google_maps, openai, grok_ai) |
| created_at | TIMESTAMP | Дата создания |

### Contact

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID (PK) | Уникальный идентификатор |
| company_id | UUID (FK → Company) | Компания контакта |
| user_id | UUID (FK → User) | Владелец |
| first_name | VARCHAR | Имя |
| last_name | VARCHAR | Фамилия |
| position | VARCHAR | Должность |
| seniority | VARCHAR, NULL | Уровень (C-level, VP, Director, Manager) |
| email | VARCHAR, NULL | Email |
| phone | VARCHAR, NULL | Телефон |
| linkedin | VARCHAR, NULL | Ссылка на LinkedIn |
| telegram | VARCHAR, NULL | Telegram |
| confidence_score | FLOAT, NULL | Степень уверенности в данных (0–1) |
| source | VARCHAR | Источник данных |
| created_at | TIMESTAMP | Дата создания |

### EmailVerification

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID (PK) | Уникальный идентификатор |
| contact_id | UUID (FK → Contact), UNIQUE | Контакт |
| email | VARCHAR | Проверяемый email |
| is_valid | BOOLEAN | Результат проверки |
| smtp_check | BOOLEAN, NULL | Результат SMTP handshake |
| catch_all | BOOLEAN, NULL | Является ли домен catch-all |
| confidence_score | FLOAT, NULL | Уверенность в результате (0–1) |
| verified_at | TIMESTAMP | Дата верификации |

### Связи

- User 1 → N Selection
- Selection 1 → N Company
- Company 1 → N Contact
- Contact 1 → 1 EmailVerification

## Поток аутентификации

1. Пользователь отправляет POST `/api/auth/register` с email, паролем и именем
2. Backend хэширует пароль (argon2) и создаёт запись в таблице User
3. Пользователь отправляет POST `/api/auth/login` с email и паролем
4. Backend проверяет пароль, генерирует JWT-токен (HS256, срок — 24 часа)
5. Frontend сохраняет токен и передаёт его в заголовке `Authorization: Bearer <token>` при каждом запросе
6. Backend валидирует токен через Guard на защищённых эндпоинтах

## Поток поиска (pipeline)

Pipeline состоит из 5 последовательных этапов:

### Этап 1. Поиск компаний (Company Search)

1. Пользователь указывает параметры: cities[] (массив городов), industry (отрасль), company_limit (лимит)
2. Frontend отправляет POST `/api/search/companies`
3. Backend создаёт Selection (status: `pending`)
4. Backend параллельно запрашивает компании из нескольких источников: Google Maps/Places API, OpenAI API (с поиском), Grok AI API (с поиском)
5. Результаты агрегируются, извлекаются домены из website, выполняется дедупликация
6. Создаются записи Company, привязанные к Selection

### Этап 2. Поиск контактов/ЛПР (Contact Discovery)

1. Пользователь запускает POST `/api/contacts/discover` с selectionId и target_roles[]
2. Backend ищет контактных лиц по каждой компании через AI-модели и открытые источники
3. AI классифицирует должности по уровням (seniority): C-level, VP, Director, Manager
4. Создаются записи Contact с полями firstName, lastName, position, seniority, source

### Этап 3. Генерация email (Email Generation)

1. Пользователь запускает POST `/api/email/generate` с selectionId
2. Backend генерирует email-адреса по паттернам на основе имени контакта и домена компании
3. Паттерны: firstname@domain, lastname@domain, f.lastname@domain, firstname.lastname@domain и др.
4. Наиболее вероятный вариант записывается в поле email контакта

### Этап 4. Верификация email (Email Verification)

1. Пользователь запускает POST `/api/verification/bulk`
2. Для каждого email выполняются проверки: MX-запись домена, SMTP handshake, catch-all detection
3. Создаются записи EmailVerification с результатами проверки

### Этап 5. Экспорт (Export)

1. Пользователь скачивает результаты через GET `/api/export/companies/csv` и GET `/api/export/contacts/csv`
2. Экспорт формируется по selectionId
3. Selection обновляется (status: `completed`)
4. Frontend отображает результаты и предлагает скачать CSV
