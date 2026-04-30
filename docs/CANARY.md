# Канареечный деплой — Runbook

## Обзор

При push в `main` CI/CD автоматически деплоит канареечный контейнер (`backend-canary`), который получает ~10% API-трафика через Nginx upstream weights. Основной `backend` остаётся на предыдущей стабильной версии.

DevOps-инженер наблюдает за канарейкой и вручную принимает решение: **промоут** (обновить основной backend) или **откат** (остановить канарейку).

## Архитектура

```
                        ┌─────────────────┐
                        │   Nginx (:80)   │
                        │  upstream pool  │
                        └───────┬─────────┘
                       ┌────────┴────────┐
                  weight=9          weight=1
              ┌────────┴──┐     ┌───────┴───────┐
              │  backend  │     │backend-canary  │
              │  (:3000)  │     │   (:3001)      │
              └─────┬─────┘     └───────┬───────┘
                    └────────┬──────────┘
                      ┌──────┴──────┐
                      │  PostgreSQL │
                      │   (:5432)   │
                      └─────────────┘
```

## Автоматический процесс (CI/CD)

1. `build-and-test` — lint, unit-тесты, e2e-тесты
2. `deploy-canary`:
   - Собирает образ `backend-canary` из текущего кода
   - Запускает канарейку на порту 3001
   - Health check канарейки (`GET http://localhost:3001/api/health`)
   - При **успехе**: переключает Nginx на `nginx.canary.conf` (10% трафика на канарейку)
   - При **неудаче**: останавливает канарейку, stable backend не затрагивается
3. `health-check` — финальная проверка через Nginx

## Промоут (ручной)

Когда DevOps убедился, что канарейка работает стабильно:

```bash
cd /path/to/project
./scripts/canary-promote.sh
```

Скрипт выполняет:
1. Пересобирает stable `backend` с текущим кодом
2. Проверяет health check stable backend
3. Переключает Nginx обратно на `nginx.conf` (без канарейки)
4. Останавливает и удаляет контейнер `backend-canary`

## Откат (ручной)

Если канарейка показывает ошибки:

```bash
cd /path/to/project
./scripts/canary-rollback.sh
```

Скрипт выполняет:
1. Переключает Nginx обратно на `nginx.conf`
2. Останавливает и удаляет контейнер `backend-canary`
3. Проверяет health check stable backend

## Что наблюдать

- **Логи канарейки**: `docker logs -f leadgen_backend_canary`
- **Логи stable**: `docker logs -f leadgen_backend`
- **Сравнение**: ошибки, время ответа, статус-коды в логах обоих контейнеров
- **Health check**: `curl http://localhost:3001/api/health` (канарейка), `curl http://localhost:3000/api/health` (stable)

## Требования

- Файл `.env` должен существовать в директории проекта для запуска скриптов promote/rollback
- Миграции БД должны быть **аддитивными** (добавление колонок/таблиц), т.к. канарейка применяет миграции к общей БД до промоута

## Конфигурационные файлы

| Файл | Описание |
|------|----------|
| `frontend/nginx.conf` | Стабильный конфиг — весь трафик на `backend:3000` |
| `frontend/nginx.canary.conf` | Канареечный конфиг — upstream pool с весами 9:1 |
| `docker-compose.prod.yml` | Сервис `backend-canary` с профилем `canary` |
| `scripts/canary-promote.sh` | Скрипт промоута канарейки |
| `scripts/canary-rollback.sh` | Скрипт отката канарейки |
