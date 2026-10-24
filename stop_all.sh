#!/usr/bin/env bash

echo "=========================================================="
echo "  STOPPING ALL DEFENSE SERVICES                          "
echo "=========================================================="

echo "[1/2] Stopping Docker containers (PostgreSQL & Adminer)..."
docker compose down

echo "[2/2] Killing any local node / next processes on port 3000..."
fuser -k 3000/tcp 2>/dev/null || true

echo "All services stopped cleanly."
