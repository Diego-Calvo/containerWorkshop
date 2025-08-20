# Simple Demo: Test Backend API and Frontend Updates
Write-Host "🚀 Azure Container Apps Workshop - Quick Demo" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$API_BASE = "http://localhost:3001"

# Function to display current stats
function Show-Stats {
    try {
        $stats = Invoke-RestMethod -Uri "$API_BASE/api/stats" -Method GET
        Write-Host "📊 Current Statistics:" -ForegroundColor Yellow
        Write-Host "   Total: $($stats.total)" -ForegroundColor White
        Write-Host "   Pending: $($stats.pending)" -ForegroundColor White
        Write-Host "   Completed: $($stats.completed)" -ForegroundColor White
        Write-Host "   Progress: $(if($stats.total -gt 0) { [math]::Round(($stats.completed / $stats.total) * 100, 1) } else { 0 })%" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "❌ Error fetching stats: $($_.Exception.Message)" -ForegroundColor Red
    }
}
}

# Show initial stats
Write-Host "📍 Initial State:" -ForegroundColor Green
Show-Stats

# Add a new todo
Write-Host "➕ Adding a new todo item..." -ForegroundColor Green
try {
    $newTodo = @{
        text = "🎯 Demo todo added via PowerShell at $(Get-Date -Format 'HH:mm:ss')"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "$API_BASE/api/todos" -Method POST -Body $newTodo -ContentType "application/json"
    Write-Host "✅ New todo added: $($result.text)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error adding todo: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📍 After adding todo:" -ForegroundColor Green
Show-Stats

Write-Host "🎯 Frontend Demo:" -ForegroundColor Magenta
Write-Host "• Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "• The new todo should appear automatically!" -ForegroundColor White
Write-Host "• Stats dashboard will update in real-time" -ForegroundColor White
Write-Host "• No frontend refresh needed - auto-updates every 10 seconds" -ForegroundColor White
Write-Host ""

# Wait and show stats again to demonstrate backend activity
Write-Host "⏳ Waiting 5 seconds to show auto-refresh effect..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "📍 Stats after 5 seconds (backend may show updated timestamps):" -ForegroundColor Green
Show-Stats

Write-Host "✨ Demo complete! The sleek frontend now displays real-time data from the DAPR-enabled backend." -ForegroundColor Cyan
