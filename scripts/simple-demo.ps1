Write-Host "Azure Container Apps Interactive Demo" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$API_BASE = "http://localhost:3001"

Write-Host "1. Current Statistics:" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$API_BASE/api/stats" -Method GET
    Write-Host "Total: $($stats.total), Pending: $($stats.pending), Completed: $($stats.completed)"
} catch {
    Write-Host "Error fetching stats"
}

Write-Host "`n2. Adding new todos..." -ForegroundColor Yellow
$body1 = @{ text = "Configure Azure Container Apps" } | ConvertTo-Json
$todo1 = Invoke-RestMethod -Uri "$API_BASE/api/todos" -Method POST -Body $body1 -ContentType "application/json"
Write-Host "Added: $($todo1.text)"

Start-Sleep -Seconds 2

$body2 = @{ text = "Deploy containerized application" } | ConvertTo-Json  
$todo2 = Invoke-RestMethod -Uri "$API_BASE/api/todos" -Method POST -Body $body2 -ContentType "application/json"
Write-Host "Added: $($todo2.text)"

Write-Host "`n3. Updated Statistics:" -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$API_BASE/api/stats" -Method GET
Write-Host "Total: $($stats.total), Pending: $($stats.pending), Completed: $($stats.completed)"

Write-Host "`n4. Completing a task..." -ForegroundColor Yellow
$result = Invoke-RestMethod -Uri "$API_BASE/api/todos/$($todo1.id)/toggle" -Method PUT
Write-Host "Completed: $($result.text)"

Start-Sleep -Seconds 2

Write-Host "`n5. Final Statistics:" -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$API_BASE/api/stats" -Method GET
Write-Host "Total: $($stats.total), Pending: $($stats.pending), Completed: $($stats.completed)"

Write-Host "`nDemo Complete! Check the frontend at http://localhost:3000" -ForegroundColor Green
Write-Host "The UI updates automatically to reflect these backend changes." -ForegroundColor Gray
