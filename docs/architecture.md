# Архитектура

## Общая схема

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Frontend   │────▶│   Backend    │────▶│ PostgreSQL │
│  React SPA  │◀────│   NestJS     │◀────│  (Prisma)  │
└─────────────┘     └──────┬───────┘     └────────────┘
                           │
                    ┌──────▼───────┐
                    │  OpenAI API  │
                    └──────────────┘
```

## Структура монорепозитория

```
bmstu_lead_gen_saas/
├── backend/           # NestJS API сервер
│   ├── src/
│   │   ├── modules/   # Модули (companies, contacts, auth, search)
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
| `companies` | CRUD компаний, экспорт CSV |
| `contacts` | CRUD контактов ЛПР, экспорт CSV |
| `search` | Поиск компаний через OpenAI API |
| `verification` | Верификация email-адресов |

## Взаимодействие

- Frontend общается с Backend через REST API
- Backend использует Prisma ORM для работы с PostgreSQL
- Для поиска компаний Backend обращается к OpenAI API
- Аутентификация через JWT-токены
