FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY packages/shared-ui/package.json ./packages/shared-ui/

RUN npm ci --workspace=frontend --workspace=@shared/ui

COPY packages/shared-ui ./packages/shared-ui
COPY frontend ./frontend

RUN npm run build --workspace=frontend

FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
