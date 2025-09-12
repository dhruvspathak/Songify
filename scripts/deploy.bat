@echo off
REM Songify Deployment Script for Windows (Podman)

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=development

set COMPOSE_FILE=docker-compose.yml
if "%ENVIRONMENT%"=="production" set COMPOSE_FILE=docker-compose.prod.yml

echo 🦭 Deploying Songify with Podman in %ENVIRONMENT% mode...

REM Check prerequisites
echo 📋 Checking prerequisites...

podman --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Podman is not installed
    echo 💡 Install Podman Desktop from: https://podman-desktop.io/
    exit /b 1
)

podman-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Podman Compose is not installed
    echo 💡 Install with: pip install podman-compose
    exit /b 1
)

REM Check environment files
if "%ENVIRONMENT%"=="production" (
    if not exist "backend\.env.production" (
        echo ❌ Missing backend\.env.production
        exit /b 1
    )
    if not exist "frontend\.env.production" (
        echo ❌ Missing frontend\.env.production
        exit /b 1
    )
) else (
    if not exist "backend\.env" (
        echo ⚠️  Creating backend\.env from Docker template
        copy "backend\env.docker.template" "backend\.env"
        echo ⚠️  Please edit backend\.env with your Spotify credentials
    )
    if not exist "frontend\.env" (
        echo ⚠️  Creating frontend\.env from Docker template
        copy "frontend\env.docker.template" "frontend\.env"
        echo ⚠️  Please edit frontend\.env with your configuration
    )
)

echo ✅ Prerequisites check passed

REM Stop existing containers
echo 🛑 Stopping existing containers...
podman-compose -f %COMPOSE_FILE% down

REM Build and start services
echo 🔨 Building and starting services with Podman...
podman-compose -f %COMPOSE_FILE% up -d --build

REM Wait for services
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check health (simplified for Windows)
echo 🏥 Checking service health...
curl -s http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Backend may still be starting...
) else (
    echo ✅ Backend is healthy
)

curl -s http://localhost:8080/ >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Frontend may still be starting...
) else (
    echo ✅ Frontend is healthy
)

REM Show service status
echo 📊 Service Status:
podman-compose -f %COMPOSE_FILE% ps

REM Show access URLs
echo 🎉 Deployment completed!
echo 📍 Access URLs:
if "%ENVIRONMENT%"=="production" (
    echo   Frontend: https://%DOMAIN%
    echo   Backend API: https://api.%DOMAIN%
) else (
    echo   Frontend: http://localhost:8080
    echo   Backend API: http://localhost:3000
)

echo 📝 Useful Podman commands:
echo   View logs: podman-compose -f %COMPOSE_FILE% logs -f
echo   Stop services: podman-compose -f %COMPOSE_FILE% down
echo   Restart services: podman-compose -f %COMPOSE_FILE% restart
echo   List containers: podman ps

echo 🦭 Songify with Podman is ready to rock! 🎵

pause
