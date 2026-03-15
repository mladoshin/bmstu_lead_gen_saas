# Условия эксплуатации

## Требования к окружению

### Серверная часть
- Node.js >= 18
- PostgreSQL >= 14
- Минимум 512 МБ RAM
- Доступ к OpenAI API (ключ)
- Доступ к Grok AI API (ключ)
- Доступ к Google Maps/Places API (ключ)

### Клиентская часть (браузер)
- Google Chrome >= 100
- Mozilla Firefox >= 100
- Safari >= 15
- Microsoft Edge >= 100

### ОС для разработки
- macOS 12+
- Ubuntu 20.04+
- Windows 10+ (с WSL2)

## Переменные окружения

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/leadgen
OPENAI_API_KEY=sk-...
GROK_API_KEY=xai-...
GOOGLE_MAPS_API_KEY=AIza...
JWT_SECRET=your-secret
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## Деплой

Деплой осуществляется через Docker и docker-compose.

### Dockerfile для backend (multi-stage)

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Dockerfile для frontend

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: leadgen
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: leadgen
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://leadgen:${DB_PASSWORD}@postgres:5432/leadgen
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      GROK_API_KEY: ${GROK_API_KEY}
      GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Пошаговый запуск

```bash
# 1. Создать .env файл в корне проекта
cp .env.example .env
# Заполнить DB_PASSWORD, OPENAI_API_KEY, GROK_API_KEY, GOOGLE_MAPS_API_KEY, JWT_SECRET

# 2. Собрать и запустить контейнеры
docker compose up -d --build

# 3. Применить миграции БД
docker compose exec backend npx prisma migrate deploy

# 4. Проверить статус
docker compose ps
```

## Локальная разработка

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd bmstu_lead_gen_saas

# 2. Установить зависимости
npm install

# 3. Настроить переменные окружения
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Заполнить значения (см. раздел "Переменные окружения" выше)

# 4. Запустить PostgreSQL (например, через Docker)
docker run -d --name leadgen-db \
  -e POSTGRES_USER=leadgen \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=leadgen \
  -p 5432:5432 \
  postgres:14-alpine

# 5. Применить миграции
cd backend && npx prisma migrate dev

# 6. Запустить dev-сервер (из корня)
cd .. && npm run dev
```

## CI/CD

Пайплайн реализован через GitHub Actions. Конфигурация: `.github/workflows/ci.yml`.

### Этапы пайплайна

1. **Lint** — проверка кода линтером (ESLint) для backend и frontend
2. **Test** — запуск юнит-тестов и интеграционных тестов
3. **Build** — сборка backend и frontend
4. **Deploy** — деплой на сервер (при пуше в main)

### Триггеры

- Push в ветки `main`, `develop`
- Pull Request в `main`

## Мониторинг и логи

Просмотр логов контейнеров:

```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f backend

# Последние 100 строк
docker compose logs --tail 100 backend
```

Бэкенд использует встроенный NestJS Logger для структурированного логирования запросов, ошибок и бизнес-событий.

## Резервное копирование PostgreSQL

### Создание бэкапа

```bash
docker compose exec postgres pg_dump -U leadgen leadgen > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление из бэкапа

```bash
docker compose exec -T postgres psql -U leadgen leadgen < backup_20260311_120000.sql
```
