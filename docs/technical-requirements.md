# Техническое задание

## 1. Общие сведения

**Название проекта:** Lead Gen SaaS — Сервис автоматического поиска B2B-контактов

**Цель:** Автоматизация поиска и сбора контактов компаний и ЛПР для B2B-продаж.

## 2. Описание продукта

### Основные функции

1. **Поиск компаний** — по выбранной отрасли и списку городов система находит релевантные компании через Google Maps, OpenAI и Grok AI
2. **Сбор доменов** — автоматическое извлечение доменов из найденных сайтов компаний
3. **Сбор контактов ЛПР** — автоматический поиск контактных данных лиц, принимающих решения, классификация должностей через AI
4. **Генерация email** — создание email-адресов по паттернам (firstname@domain, f.lastname@domain и т.д.)
5. **Верификация email** — проверка валидности через MX check, SMTP handshake, catch-all detection
6. **Экспорт данных** — формирование CSV-таблиц с компаниями и контактами по выборке

### Пользовательские сценарии

1. Пользователь регистрируется/авторизуется в системе
2. Указывает параметры поиска: отрасль, города (массив), лимит компаний
3. Система запускает поиск компаний через множество источников (Google Maps, OpenAI, Grok AI), извлекает домены, дедуплицирует результаты
4. Пользователь запускает поиск контактов ЛПР по найденным компаниям с указанием целевых ролей
5. Система генерирует email-адреса по паттернам на основе имени и домена
6. Система верифицирует email-адреса (MX, SMTP, catch-all)
7. Пользователь скачивает результат в формате CSV

## 3. Техническая архитектура

См. [Архитектура](architecture.md)

## 4. Требования к данным

### Таблица компаний (CSV)
- Название компании (company_name)
- Сайт (website)
- Домен (domain)
- Телефон (phone)
- Общий email компании (email_general)
- Город (city)

### Таблица контактов ЛПР (CSV)
- Компания (company_name)
- ФИО (full_name)
- Должность (position)
- Email (email)
- Телефон (phone)
- LinkedIn (linkedin)
- Telegram (telegram)
- Уверенность (confidence_score)

## 5. Нефункциональные требования

- Время поиска — до 60 секунд на запрос
- Поддержка современных браузеров (Chrome, Firefox, Safari)
- Адаптивный интерфейс

## 6. API

Все эндпоинты доступны по префиксу `/api`. Защищённые эндпоинты требуют JWT-токен в заголовке `Authorization: Bearer <token>`.

Полное описание эндпоинтов — см. [Архитектура → API эндпоинты](architecture.md#api-эндпоинты).

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| POST | `/api/auth/register` | Регистрация | Нет |
| POST | `/api/auth/login` | Авторизация | Нет |
| GET | `/api/auth/me` | Профиль | Да |
| GET | `/api/selections` | Список выборок | Да |
| GET | `/api/selections/:id` | Получение выборки | Да |
| DELETE | `/api/selections/:id` | Удаление выборки | Да |
| POST | `/api/search/companies` | Запуск поиска компаний | Да |
| GET | `/api/companies` | Список компаний | Да |
| POST | `/api/companies` | Создание компании | Да |
| GET | `/api/contacts` | Список контактов | Да |
| POST | `/api/contacts` | Создание контакта | Да |
| POST | `/api/contacts/discover` | Поиск контактов/ЛПР | Да |
| POST | `/api/email/generate` | Генерация email по паттернам | Да |
| POST | `/api/verification/verify` | Верификация email | Да |
| POST | `/api/verification/bulk` | Массовая верификация | Да |
| GET | `/api/export/companies/csv` | Экспорт компаний в CSV | Да |
| GET | `/api/export/contacts/csv` | Экспорт контактов в CSV | Да |

## 7. Сущности базы данных

Полная схема с типами полей и связями — см. [Архитектура → Схема БД](architecture.md#схема-базы-данных).

### User

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID (PK) | Уникальный идентификатор |
| email | VARCHAR, UNIQUE | Email пользователя |
| password_hash | VARCHAR | Хэш пароля (argon2) |
| name | VARCHAR | Имя пользователя |
| created_at | TIMESTAMP | Дата регистрации |
| updated_at | TIMESTAMP | Дата обновления |

### Selection (выборка)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID (PK) | Уникальный идентификатор |
| user_id | UUID (FK → User) | Владелец выборки |
| name | VARCHAR | Автоимя: "{industry} — {cities}" |
| industry | VARCHAR | Отрасль |
| cities | JSON | Массив городов |
| company_limit | INTEGER | Лимит компаний |
| target_roles | JSON | Целевые роли ЛПР |
| status | ENUM | pending, in_progress, completed, failed |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

### Company

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID (PK) | Уникальный идентификатор |
| selection_id | UUID (FK → Selection) | Выборка |
| user_id | UUID (FK → User) | Владелец |
| name | VARCHAR | Название компании |
| industry | VARCHAR | Отрасль |
| city | VARCHAR | Город |
| website | VARCHAR, NULL | Сайт |
| domain | VARCHAR, NULL | Домен |
| phone | VARCHAR, NULL | Телефон |
| email_general | VARCHAR, NULL | Общий email |
| country | VARCHAR, NULL | Страна |
| address | VARCHAR, NULL | Адрес |
| source | VARCHAR | Источник данных |
| created_at | TIMESTAMP | Дата создания |

### Contact

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID (PK) | Уникальный идентификатор |
| company_id | UUID (FK → Company) | Компания |
| user_id | UUID (FK → User) | Владелец |
| first_name | VARCHAR | Имя |
| last_name | VARCHAR | Фамилия |
| position | VARCHAR | Должность |
| seniority | VARCHAR, NULL | Уровень (C-level, VP, Director, Manager) |
| email | VARCHAR, NULL | Email |
| phone | VARCHAR, NULL | Телефон |
| linkedin | VARCHAR, NULL | LinkedIn |
| telegram | VARCHAR, NULL | Telegram |
| confidence_score | FLOAT, NULL | Уверенность (0–1) |
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
| catch_all | BOOLEAN, NULL | Catch-all домен |
| confidence_score | FLOAT, NULL | Уверенность (0–1) |
| verified_at | TIMESTAMP | Дата верификации |

## 8. Безопасность

| Аспект | Реализация |
|--------|------------|
| Аутентификация | JWT (алгоритм HS256, срок действия — 24 часа) |
| Хэширование паролей | argon2 |
| Секреты | Передаются через переменные окружения (.env), не хранятся в коде |
| Транспорт | HTTPS в продакшен-окружении |
| Авторизация | Guard на уровне контроллеров, проверка принадлежности ресурса пользователю |

## 9. Деплой

Стратегия деплоя — Docker-контейнеры через docker-compose. Подробная процедура описана в [Условия эксплуатации](operations.md#деплой).

## 10. История изменений

| Дата | Версия | Описание |
|------|--------|----------|
| 2026-03-03 | 0.1 | Первоначальная версия ТЗ |
| 2026-03-11 | 0.2 | Добавлены разделы API, сущности БД, безопасность, деплой |
| 2026-03-11 | 0.3 | Адаптация под новую бизнес-логику: 5-этапный pipeline, Selection вместо SearchSession, EmailVerification, множество источников данных, генерация email по паттернам |
