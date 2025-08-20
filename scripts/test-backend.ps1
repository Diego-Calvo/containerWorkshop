# Test script to verify the workshop application works
Write-Host "🧪 Testing Workshop Application Backend" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Test 1: Health endpoint
Write-Host "🩺 Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Health check passed!" -ForegroundColor Green
    Write-Host "Status: $($healthResponse.status)" -ForegroundColor White
    Write-Host "Version: $($healthResponse.version)" -ForegroundColor White
    Write-Host "DAPR Enabled: $($healthResponse.dapr.enabled)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the backend is running: cd backend; node src/app.js" -ForegroundColor Yellow
    exit 1
}

# Test 2: Get todos
Write-Host "📋 Testing Todos API..." -ForegroundColor Yellow
try {
    $todos = Invoke-RestMethod -Uri "http://localhost:3001/api/todos" -Method Get -TimeoutSec 5
    Write-Host "✅ Todos API working!" -ForegroundColor Green
    Write-Host "Found $($todos.Count) todo items:" -ForegroundColor White
    foreach ($todo in $todos) {
        $status = if ($todo.completed) { "✅" } else { "⭕" }
        Write-Host "  $status $($todo.text)" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "❌ Todos API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Add a new todo
Write-Host "➕ Testing Add Todo..." -ForegroundColor Yellow
try {
    $newTodo = @{
        text = "Test todo from PowerShell script"
        completed = $false
    } | ConvertTo-Json

    $addResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/todos" -Method Post -Body $newTodo -ContentType "application/json" -TimeoutSec 5
    Write-Host "✅ Add todo worked!" -ForegroundColor Green
    Write-Host "Created: $($addResponse.text)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Add todo failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get statistics
Write-Host "📊 Testing Statistics API..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3001/api/stats" -Method Get -TimeoutSec 5
    Write-Host "✅ Statistics API working!" -ForegroundColor Green
    Write-Host "Total: $($stats.total)" -ForegroundColor White
    Write-Host "Completed: $($stats.completed)" -ForegroundColor White
    Write-Host "Pending: $($stats.pending)" -ForegroundColor White
    Write-Host "DAPR Enabled: $($stats.daprEnabled)" -ForegroundColor White
    Write-Host "Version: $($stats.version)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Statistics API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎯 Backend Testing Complete!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test the frontend: cd frontend; npm start" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Or test with Docker: docker-compose up --build" -ForegroundColor White
