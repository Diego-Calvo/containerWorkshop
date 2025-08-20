param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigFile = ".workshop-config.json",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$false)]
    [string]$RegistryName,
    
    [Parameter(Mandatory=$false)]
    [string]$EnvironmentName,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false
)

Write-Host "🚀 Building and Deploying Workshop Application" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Load configuration if file exists
if (Test-Path $ConfigFile) {
    Write-Host "📋 Loading configuration from $ConfigFile" -ForegroundColor Yellow
    $config = Get-Content $ConfigFile | ConvertFrom-Json
    
    if (!$ResourceGroupName) { $ResourceGroupName = $config.resourceGroupName }
    if (!$RegistryName) { $RegistryName = $config.containerRegistryName }
    if (!$EnvironmentName) { $EnvironmentName = $config.environmentName }
    
    $containerRegistryLoginServer = $config.containerRegistryLoginServer
} else {
    Write-Host "⚠️ Configuration file not found. Using provided parameters..." -ForegroundColor Yellow
    if (!$ResourceGroupName -or !$RegistryName -or !$EnvironmentName) {
        Write-Error "Missing required parameters. Please provide ResourceGroupName, RegistryName, and EnvironmentName or ensure .workshop-config.json exists."
        exit 1
    }
    $containerRegistryLoginServer = "$RegistryName.azurecr.io"
}

# Check if Docker is running
Write-Host "🐳 Checking Docker status..." -ForegroundColor Yellow
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    }
} catch {
    Write-Error "Docker is not installed or not running. Please install Docker Desktop and try again."
    exit 1
}

# Login to Azure Container Registry
Write-Host "🔐 Logging in to Azure Container Registry..." -ForegroundColor Yellow
az acr login --name $RegistryName
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to login to Azure Container Registry"
    exit 1
}

if (!$SkipBuild) {
    # Build and push frontend
    Write-Host "🏗️ Building frontend container..." -ForegroundColor Yellow
    docker build -t "$containerRegistryLoginServer/workshop-frontend:latest" ./frontend
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build frontend container"
        exit 1
    }

    Write-Host "📤 Pushing frontend container..." -ForegroundColor Yellow
    docker push "$containerRegistryLoginServer/workshop-frontend:latest"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push frontend container"
        exit 1
    }

    # Build and push backend
    Write-Host "🏗️ Building backend container..." -ForegroundColor Yellow
    docker build -t "$containerRegistryLoginServer/workshop-backend:latest" ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build backend container"
        exit 1
    }

    Write-Host "📤 Pushing backend container..." -ForegroundColor Yellow
    docker push "$containerRegistryLoginServer/workshop-backend:latest"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push backend container"
        exit 1
    }
}

# Update container apps with new images
Write-Host "🔄 Updating backend container app..." -ForegroundColor Yellow
az containerapp update `
    --name "workshop-backend" `
    --resource-group $ResourceGroupName `
    --image "$containerRegistryLoginServer/workshop-backend:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to update backend container app"
    exit 1
}

Write-Host "🔄 Updating frontend container app..." -ForegroundColor Yellow
az containerapp update `
    --name "workshop-frontend" `
    --resource-group $ResourceGroupName `
    --image "$containerRegistryLoginServer/workshop-frontend:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to update frontend container app"
    exit 1
}

# Get the application URLs
Write-Host "📊 Retrieving application URLs..." -ForegroundColor Yellow
$frontendUrl = az containerapp show --name "workshop-frontend" --resource-group $ResourceGroupName --query "properties.configuration.ingress.fqdn" -o tsv
$backendUrl = az containerapp show --name "workshop-backend" --resource-group $ResourceGroupName --query "properties.configuration.ingress.fqdn" -o tsv

Write-Host "✅ Application deployment completed successfully!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: https://$frontendUrl" -ForegroundColor White
Write-Host "   Backend:  https://$backendUrl" -ForegroundColor White
Write-Host "   API Health: https://$backendUrl/health" -ForegroundColor White
Write-Host "   API Stats: https://$backendUrl/api/stats" -ForegroundColor White
Write-Host "===============================================" -ForegroundColor Green

# Test the application
Write-Host "🧪 Testing application health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://$backendUrl/health" -Method Get -TimeoutSec 30
    Write-Host "✅ Backend health check passed!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor White
    Write-Host "   Version: $($response.version)" -ForegroundColor White
    Write-Host "   DAPR Enabled: $($response.dapr.enabled)" -ForegroundColor White
} catch {
    Write-Host "⚠️ Backend health check failed. The application might still be starting up." -ForegroundColor Yellow
    Write-Host "   Please wait a few minutes and check the URLs manually." -ForegroundColor White
}

Write-Host "🎯 Workshop is ready!" -ForegroundColor Cyan
Write-Host "   You can now:" -ForegroundColor White
Write-Host "   • Open the frontend URL in your browser" -ForegroundColor White
Write-Host "   • Make changes to the code and re-run this script" -ForegroundColor White
Write-Host "   • Test the API endpoints directly" -ForegroundColor White
Write-Host "===============================================" -ForegroundColor Green
