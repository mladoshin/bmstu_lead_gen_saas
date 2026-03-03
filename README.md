# Lead Gen SaaS — Сервис автоматического поиска B2B-контактов

Сервис автоматического поиска B2B-контактов с использованием ИИ-моделей (OpenAI).

## Что делает сервис

- По выбранной нише и городу находит компании
- Собирает контакты ЛПР (лиц, принимающих решения)
- Верифицирует email-адреса
- Формирует таблицу компаний (CSV)
- Формирует таблицу контактов ЛПР (CSV)

Результат — готовая база для аутрича и продаж.

## Стек технологий

| Слой | Технология |
|------|-----------|
| Монорепо | Turborepo |
| Бэкенд | NestJS, TypeScript, Prisma |
| База данных | PostgreSQL |
| Фронтенд | React (SPA), TypeScript |
| CI/CD | GitHub Actions |
| Трекер задач | GitHub Issues |

## Структура репозитория

```
bmstu_lead_gen_saas/
├── backend/          # NestJS API
├── frontend/         # React SPA
├── docs/             # Документация проекта
├── README.md
├── CONTRIBUTING.md
└── turbo.json
```

## Быстрый старт

### Требования

- Node.js >= 18
- PostgreSQL >= 14
- npm или yarn

### Установка

```bash
# Клонировать репозиторий
git clone <repo-url>
cd bmstu_lead_gen_saas

# Установить зависимости
npm install

# Скопировать .env файлы
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Применить миграции БД
cd backend && npx prisma migrate dev

# Запустить все сервисы
npm run dev
```

## Документация

- [Техническое задание](docs/technical-requirements.md)
- [Глоссарий](docs/glossary.md)
- [Архитектура](docs/architecture.md)
- [Условия эксплуатации](docs/operations.md)
- [Регламент веток и коммитов](docs/git-workflow.md)

## Команда

1) Максим Ладошин, ИУ7-81Б
2) Родинков Алексей, ИУ7-81БВ

Проект разрабатывается в рамках курса «Технологии командной разработки ПО» (МГТУ им. Баумана).
