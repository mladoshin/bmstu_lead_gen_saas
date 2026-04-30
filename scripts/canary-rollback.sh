#!/bin/bash
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"

if [ ! -f .env ]; then
  echo "ERROR: .env file not found."
  echo "Create .env with POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, JWT_SECRET, OPENAI_API_KEY, GOOGLE_MAPS_API_KEY"
  exit 1
fi

echo "=== Rolling back canary ==="

echo "Step 1: Switching nginx to stable config..."
NGINX_CONF_FILE=nginx.conf docker compose -f "$COMPOSE_FILE" up -d --force-recreate frontend

echo "Step 2: Stopping canary..."
docker compose -f "$COMPOSE_FILE" --profile canary stop backend-canary
docker compose -f "$COMPOSE_FILE" --profile canary rm -f backend-canary

echo "Step 3: Verifying stable backend..."
for i in 1 2 3; do
  if curl --fail --silent --max-time 10 http://localhost/api/health; then
    echo ""
    echo "Stable backend is healthy."
    break
  fi
  if [ "$i" -eq 3 ]; then
    echo "ERROR: Stable backend failed health check after rollback! Manual intervention required."
    exit 1
  fi
  echo "Attempt $i failed, retrying in 3s..."
  sleep 3
done

echo "=== Rollback complete ==="
echo "All traffic routed to stable backend. Canary removed."
