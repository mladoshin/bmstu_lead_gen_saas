# Условия эксплуатации

## Требования к окружению

### Серверная часть
- Node.js >= 18
- PostgreSQL >= 14
- Минимум 512 МБ RAM
- Доступ к OpenAI API (ключ)

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
JWT_SECRET=your-secret
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## Деплой

TODO: описать процедуру деплоя после настройки CI/CD.
