#!/bin/bash
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"

if [ ! -f .env ]; then
  echo "ERROR: .env file not found."
  echo "Create .env with POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, JWT_SECRET, OPENAI_API_KEY, GOOGLE_MAPS_API_KEY"
  exit 1
fi

echo "=== Promoting canary to stable ==="

echo "Step 1: Rebuilding stable backend with current code..."
docker compose -f "$COMPOSE_FILE" build backend
docker compose -f "$COMPOSE_FILE" up -d backend

echo "Step 2: Health checking stable backend on port 3000..."
sleep 10
for i in 1 2 3 4 5; do
  if curl --fail --silent --max-time 10 http://localhost:3000/api/health; then
    echo ""
    echo "Stable backend is healthy."
    break
  fi
  if [ "$i" -eq 5 ]; then
    echo "ERROR: Stable backend failed health check! Manual intervention required."
    exit 1
  fi
  echo "Attempt $i failed, retrying in 5s..."
  sleep 5
done

echo "Step 3: Switching nginx to stable config..."
NGINX_CONF_FILE=nginx.conf docker compose -f "$COMPOSE_FILE" up -d --force-recreate frontend

echo "Step 4: Stopping canary..."
docker compose -f "$COMPOSE_FILE" --profile canary stop backend-canary
docker compose -f "$COMPOSE_FILE" --profile canary rm -f backend-canary

echo "=== Promotion complete ==="
echo "Stable backend is now running the new version."
echo "Canary container has been removed."
