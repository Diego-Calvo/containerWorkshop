# Local Testing Script for Azure Container Apps Workshop
# This script helps test the application locally before deploying to Azure

Write-Host "🧪 Azure Container Apps Workshop - Local Testing" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if Docker is running
Write-Host "🐳 Checking Docker status..." -ForegroundColor Yellow
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Error "Docker is not installed or not running. Please install Docker Desktop and try again."
    exit 1
}

# Check if Docker Compose is available
Write-Host "🔧 Checking Docker Compose..." -ForegroundColor Yellow
$composeVersion = docker-compose --version 2>$null
if ($composeVersion) {
    Write-Host "✅ Docker Compose is available: $composeVersion" -ForegroundColor Green
} else {
    Write-Error "Docker Compose is not available. Please install it."
    exit 1
}

# Start the application stack
Write-Host "🚀 Starting the workshop application..." -ForegroundColor Yellow
Write-Host "This will build and start both frontend and backend containers" -ForegroundColor Cyan

docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Application started successfully!" -ForegroundColor Green
    
    # Wait for services to be healthy
    Write-Host "⏳ Waiting for services to become healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Check service status
    Write-Host "📊 Checking service status..." -ForegroundColor Yellow
    docker-compose ps
    
    Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
    Write-Host "   API Health: http://localhost:3001/health" -ForegroundColor White
    Write-Host "   API Stats: http://localhost:3001/api/stats" -ForegroundColor White
    
    # Test backend health
    Write-Host "🩺 Testing backend health..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get -TimeoutSec 10
        Write-Host "✅ Backend health check passed!" -ForegroundColor Green
        Write-Host "   Status: $($response.status)" -ForegroundColor White
        Write-Host "   Version: $($response.version)" -ForegroundColor White
    } catch {
        Write-Host "⚠️ Backend health check failed. Services might still be starting up." -ForegroundColor Yellow
        Write-Host "   Please wait a few more seconds and check manually." -ForegroundColor White
    }
    
    Write-Host "🎯 Testing Instructions:" -ForegroundColor Cyan
    Write-Host "   1. Open http://localhost:3000 in your browser" -ForegroundColor White
    Write-Host "   2. Add some todo items" -ForegroundColor White
    Write-Host "   3. Mark items as complete" -ForegroundColor White
    Write-Host "   4. Check the API directly: http://localhost:3001/api/todos" -ForegroundColor White
    Write-Host "   5. View statistics: http://localhost:3001/api/stats" -ForegroundColor White
    
    Write-Host "🛑 To stop the application:" -ForegroundColor Cyan
    Write-Host "   docker-compose down" -ForegroundColor White
    
    Write-Host "📝 To view logs:" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f" -ForegroundColor White
    
} else {
    Write-Error "Failed to start the application. Check the output above for errors."
}

Write-Host "=================================================" -ForegroundColor Green
