@echo off
echo ==========================================================
echo   CRAVELY DEFENSE LAUNCHER (1-CLICK LOCAL STARTUP)       
echo ==========================================================

REM Check Docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker is not active. Attempting to start Docker Desktop automatically...
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        echo Waiting for Docker engine to initialize (approx 15-20 seconds)...
        :wait_docker
        timeout /t 3 /nobreak >nul
        docker info >nul 2>&1
        if %errorlevel% neq 0 (
            echo   Still waiting for Docker engine to become ready...
            goto wait_docker
        )
        echo Docker Desktop initialized successfully!
    ) else (
        echo [-] Could not find Docker Desktop in default installation folder.
        echo Please click to open Docker Desktop manually, then run this file again!
        pause
        exit /b 1
    )
)

echo [1/4] Starting local PostgreSQL (pgvector) and Adminer (port 8080)...
docker compose up -d

echo [2/4] Waiting 5 seconds for PostgreSQL container to initialize...
timeout /t 5 /nobreak >nul

echo [3/4] Ensuring database schema and initial data are seeded...
set DATABASE_URL=postgresql://postgres:password@localhost:5432/recipe_ai?schema=public
call npx prisma db push --accept-data-loss
call npx tsx prisma/seed.ts

echo [4/4] Starting Next.js Web Application on http://localhost:3000...
echo ==========================================================
echo   DEFENSE SERVICES READY:                                
echo   - Web Application: http://localhost:3000              
echo   - Database GUI:    http://localhost:8080              
echo     * System:   PostgreSQL                              
echo     * Server:   localhost                               
echo     * Username: postgres                                
echo     * Password: password                                
echo     * Database: recipe_ai                               
echo ==========================================================
call npm run dev
