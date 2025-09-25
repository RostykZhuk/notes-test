@echo off
echo Setting up QuickNotes Backend...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from example...
    copy env.example .env
    echo Created .env file. Please edit it with your configuration.
) else (
    echo .env file already exists.
)

REM Build and start services
echo Building Docker images...
docker-compose build

echo Starting services...
docker-compose up -d

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 30 /nobreak >nul

echo.
echo QuickNotes Backend setup complete!
echo.
echo API is available at: http://localhost:8080
echo Health check: http://localhost:8080/health
echo Metrics: http://localhost:8080/metrics
echo.
echo API Documentation:
echo    - Register: POST /api/auth/register
echo    - Login: POST /api/auth/login
echo    - Notes: GET/POST/PUT/DELETE /api/notes
echo    - Search: GET /api/notes/search?tags=work,ideas
echo.
echo Useful commands:
echo    - View logs: docker-compose logs -f
echo    - Stop services: docker-compose down
echo    - Restart: docker-compose restart
echo.
echo For development with live reload:
echo    docker-compose -f docker-compose.yml -f docker-compose.override.yml up
