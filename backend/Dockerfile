FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

RUN npm ci --workspace=backend

COPY backend ./backend

RUN cd backend && npx prisma generate && npm run build

FROM node:20-alpine

WORKDIR /app

COPY backend/package.json ./
COPY backend/prisma ./prisma

RUN npm install --omit=dev

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["sh", "-c", "npx -y prisma migrate deploy && node dist/main"]
