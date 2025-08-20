# Demo Script: Backend Data Changes with Frontend Auto-Update
# This script demonstrates how the frontend automatically updates when backend data changes

Write-Host "🚀 Azure Container Apps Workshop - Interactive Demo" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$API_BASE = "http://localhost:3001"

# Function to display stats
function Show-Stats {
    Write-Host "📊 Current Statistics:" -ForegroundColor Yellow
    try {
        $stats = Invoke-RestMethod -Uri "$API_BASE/api/stats" -Method GET
        Write-Host "   Total: $($stats.total)" -ForegroundColor White
        Write-Host "   Pending: $($stats.pending)" -ForegroundColor White
        Write-Host "   Completed: $($stats.completed)" -ForegroundColor White
        Write-Host "   Progress: $(if($stats.total -gt 0) { [math]::Round(($stats.completed / $stats.total) * 100, 1) } else { 0 })%" -ForegroundColor White
        Write-Host "   DAPR Enabled: $($stats.daprEnabled)" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "   Error fetching stats: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to add a todo
function Add-Todo {
    param([string]$text)
    try {
        $body = @{ text = $text } | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$API_BASE/api/todos" -Method POST -Body $body -ContentType "application/json"
        Write-Host "✅ Added: $($result.text)" -ForegroundColor Green
        return $result.id
    } catch {
        Write-Host "❌ Error adding todo: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to toggle a todo
function Toggle-Todo {
    param([string]$id)
    try {
        $result = Invoke-RestMethod -Uri "$API_BASE/api/todos/$id/toggle" -Method PUT
        Write-Host "🔄 Toggled: $($result.text) - Completed: $($result.completed)" -ForegroundColor Blue
    } catch {
        Write-Host "❌ Error toggling todo: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main Demo Flow
Write-Host "🎯 Demo: Watch the frontend update automatically as we change backend data!" -ForegroundColor Magenta
Write-Host "Open http://localhost:3000 in your browser to see real-time updates" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to start the demo..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "1️⃣ Initial State:" -ForegroundColor Cyan
Show-Stats

Write-Host "2️⃣ Adding workshop todos..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

$todo1 = Add-Todo "🔧 Configure Azure Container Apps Environment"
Start-Sleep -Seconds 1

$todo2 = Add-Todo "📦 Deploy containerized application"
Start-Sleep -Seconds 1

$todo3 = Add-Todo "🌐 Set up custom domains and SSL"
Start-Sleep -Seconds 1

$todo4 = Add-Todo "📊 Monitor application performance"
Start-Sleep -Seconds 1

$todo5 = Add-Todo "🚀 Scale application based on demand"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "📈 After adding 5 new todos:" -ForegroundColor Cyan
Show-Stats

Write-Host "3️⃣ Completing some tasks..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

if ($todo1) { 
    Toggle-Todo $todo1
    Start-Sleep -Seconds 1
}

if ($todo3) { 
    Toggle-Todo $todo3
    Start-Sleep -Seconds 1
}

if ($todo5) { 
    Toggle-Todo $todo5
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "🎉 After completing 3 tasks:" -ForegroundColor Cyan
Show-Stats

Write-Host "4️⃣ Adding some fun todos..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

Add-Todo "🎨 Customize the frontend theme"
Start-Sleep -Seconds 1

Add-Todo "🔍 Add search functionality"
Start-Sleep -Seconds 1

Add-Todo "📱 Make it mobile responsive"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "📊 Final statistics:" -ForegroundColor Cyan
Show-Stats

Write-Host "✨ Demo Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Key Observations:" -ForegroundColor Yellow
Write-Host "   • Frontend updates automatically every 10 seconds" -ForegroundColor White
Write-Host "   • Real-time statistics dashboard shows live data" -ForegroundColor White
Write-Host "   • DAPR state management ensures data persistence" -ForegroundColor White
Write-Host "   • No frontend code changes needed for backend updates" -ForegroundColor White
Write-Host "   • Animations and visual feedback enhance user experience" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Try interacting with the web interface while running this script!" -ForegroundColor Magenta
Write-Host "The changes will be reflected in both the API and the UI immediately." -ForegroundColor Gray
