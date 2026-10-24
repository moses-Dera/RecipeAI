@echo off
echo ==========================================================
echo   STOPPING ALL DEFENSE SERVICES                          
echo ==========================================================

echo [1/2] Stopping Docker containers...
docker compose down

echo [2/2] Done. All services stopped.
pause
