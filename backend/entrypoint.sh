#!/bin/sh
# entrypoint.sh — runs in the backend Docker container
# Waits for DB, runs migrations, starts the server

set -e

echo "⏳ Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete. Starting server..."
exec node dist/server.js
