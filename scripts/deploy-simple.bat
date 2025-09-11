@echo off
REM Simple Podman Deployment for Windows
setlocal enabledelayedexpansion

echo 🦭 Starting Songify with individual Podman commands...

REM Check prerequisites
podman --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Podman is not installed
    echo 💡 Install Podman Desktop from: https://podman-desktop.io/
    exit /b 1
)

REM Check environment files
if not exist "backend\.env" (
    echo ⚠️  Creating backend\.env from template
    copy "backend\env.template" "backend\.env"
    echo ⚠️  Please edit backend\.env with your Spotify credentials
    echo Press any key after editing backend\.env...
    pause
)

if not exist "frontend\.env" (
    echo ⚠️  Creating frontend\.env from template
    copy "frontend\env.template" "frontend\.env"
    echo ⚠️  Please edit frontend\.env with your configuration
    echo Press any key after editing frontend\.env...
    pause
)

echo ✅ Prerequisites check passed

REM Create network
echo 🌐 Creating network...
podman network create songify-network 2>nul

REM Stop and remove existing containers
echo 🛑 Cleaning up existing containers...
podman stop songify-backend songify-frontend songify-redis 2>nul
podman rm songify-backend songify-frontend songify-redis 2>nul

REM Start Redis
echo 🗄️ Starting Redis...
podman run -d ^
  --name songify-redis ^
  --network songify-network ^
  -p 6379:6379 ^
  redis:7-alpine ^
  redis-server --appendonly yes

REM Build and start backend
echo 🔨 Building and starting backend...
podman build -t songify-backend ./backend
podman run -d ^
  --name songify-backend ^
  --network songify-network ^
  -p 3000:3000 ^
  --env-file backend\.env ^
  -e NODE_ENV=production ^
  -e PORT=3000 ^
  -e FRONTEND_URL=http://localhost ^
  songify-backend

REM Build and start frontend
echo 🎨 Building and starting frontend...
podman build -t songify-frontend ./frontend
podman run -d ^
  --name songify-frontend ^
  --network songify-network ^
  -p 80:80 ^
  --env-file frontend\.env ^
  songify-frontend

REM Wait for services
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Check health
echo 🏥 Checking service health...
curl -s http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Backend may still be starting...
) else (
    echo ✅ Backend is healthy
)

curl -s http://localhost/ >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Frontend may still be starting...
) else (
    echo ✅ Frontend is healthy
)

REM Show service status
echo 📊 Service Status:
podman ps --filter name=songify

echo.
echo 🎉 Deployment completed!
echo 📍 Access URLs:
echo   Frontend: http://localhost
echo   Backend API: http://localhost:3000
echo.
echo 📝 Useful commands:
echo   View logs: podman logs songify-backend
echo   Stop services: podman stop songify-backend songify-frontend songify-redis
echo   Remove containers: podman rm songify-backend songify-frontend songify-redis
echo.
echo 🦭 Songify with Podman is ready to rock! 🎵

pause
