#!/bin/bash
set -e

echo "=== Asset-Manager Update Script ==="
echo "$(date)"

cd /root/Asset-Manager

echo "1. Pulling latest code..."
git pull origin main

echo "2. Rebuilding Docker containers..."
docker compose -p asset-manager down
docker compose -p asset-manager up -d --build

echo "3. Waiting for database to be ready..."
sleep 10

echo "4. Running database migrations..."
docker compose -p asset-manager exec app npx drizzle-kit push --force

echo "=== Update complete! ==="
echo "App is running at http://$(curl -s ifconfig.me):3001"
