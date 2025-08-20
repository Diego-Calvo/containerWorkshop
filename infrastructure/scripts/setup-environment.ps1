param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [string]$EnvironmentName = "workshop-env",
    
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId
)

Write-Host "🚀 Setting up Azure Container Apps Workshop Environment" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Check if Azure CLI is installed
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI is not installed. Please install it first: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

# Login check
Write-Host "🔐 Checking Azure CLI login status..." -ForegroundColor Yellow
$loginCheck = az account show 2>$null
if (!$loginCheck) {
    Write-Host "❌ Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

# Set subscription if provided
if ($SubscriptionId) {
    Write-Host "📋 Setting subscription to: $SubscriptionId" -ForegroundColor Yellow
    az account set --subscription $SubscriptionId
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to set subscription"
        exit 1
    }
}

# Create resource group
Write-Host "🏗️ Creating resource group: $ResourceGroupName in $Location" -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create resource group"
    exit 1
}

# Install/Update Container Apps extension
Write-Host "🔧 Installing Azure Container Apps CLI extension..." -ForegroundColor Yellow
az extension add --name containerapp --upgrade 2>$null

# Register required providers
Write-Host "📦 Registering required Azure providers..." -ForegroundColor Yellow
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait
az provider register --namespace Microsoft.ContainerRegistry --wait
az provider register --namespace Microsoft.DocumentDB --wait

# Deploy infrastructure using Bicep
Write-Host "🏗️ Deploying infrastructure with Bicep..." -ForegroundColor Yellow
$deploymentName = "workshop-infrastructure-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file "./infrastructure/bicep/main.bicep" `
    --parameters environmentName=$EnvironmentName location=$Location `
    --name $deploymentName

if ($LASTEXITCODE -ne 0) {
    Write-Error "Infrastructure deployment failed"
    exit 1
}

# Get deployment outputs
Write-Host "📊 Retrieving deployment outputs..." -ForegroundColor Yellow
$outputs = az deployment group show --resource-group $ResourceGroupName --name $deploymentName --query properties.outputs -o json | ConvertFrom-Json

$containerRegistryName = $outputs.containerRegistryName.value
$containerRegistryLoginServer = $outputs.containerRegistryLoginServer.value
$environmentName = $outputs.containerAppsEnvironmentName.value
$frontendUrl = $outputs.frontendUrl.value
$backendUrl = $outputs.backendUrl.value

Write-Host "✅ Infrastructure deployment completed successfully!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "   Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "   Location: $Location" -ForegroundColor White
Write-Host "   Container Registry: $containerRegistryName" -ForegroundColor White
Write-Host "   Registry Login Server: $containerRegistryLoginServer" -ForegroundColor White
Write-Host "   Container Apps Environment: $environmentName" -ForegroundColor White
Write-Host "   Frontend URL: $frontendUrl" -ForegroundColor White
Write-Host "   Backend URL: $backendUrl" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Green

# Save configuration for next steps
$config = @{
    resourceGroupName = $ResourceGroupName
    location = $Location
    environmentName = $environmentName
    containerRegistryName = $containerRegistryName
    containerRegistryLoginServer = $containerRegistryLoginServer
    frontendUrl = $frontendUrl
    backendUrl = $backendUrl
    deploymentDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

$config | ConvertTo-Json | Out-File -FilePath ".workshop-config.json" -Encoding UTF8

Write-Host "💾 Configuration saved to .workshop-config.json" -ForegroundColor Green
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run the application deployment script: ./scripts/build-and-deploy.ps1" -ForegroundColor White
Write-Host "   2. Open the frontend URL once deployment is complete" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Green
