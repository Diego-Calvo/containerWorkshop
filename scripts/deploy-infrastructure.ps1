# Container Workshop - Local Deployment Script
# This script allows you to deploy the infrastructure locally for testing

param(
    [string]$ResourceGroupName = "containerWorkshop",
    [string]$Location = "eastus2",
    [string]$EnvironmentName = "workshop-dev-env",
    [string]$SubscriptionId = "",
    [switch]$WhatIf = $false
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = $Reset)
    Write-Host "$Color$Message$Reset"
}

Write-ColorOutput "🚀 Container Workshop Deployment Script" $Blue
Write-ColorOutput "=" * 50 $Blue

# Check prerequisites
Write-ColorOutput "📋 Checking Prerequisites..." $Yellow

# Check Azure CLI
try {
    $azVersion = az --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Azure CLI is installed" $Green
    } else {
        throw "Azure CLI not found"
    }
} catch {
    Write-ColorOutput "❌ Azure CLI is not installed or not in PATH" $Red
    Write-ColorOutput "Please install Azure CLI: https://docs.microsoft.com/cli/azure/install-azure-cli" $Yellow
    exit 1
}

# Check if logged in
try {
    $account = az account show 2>$null | ConvertFrom-Json
    if ($account) {
        Write-ColorOutput "✅ Logged in to Azure as: $($account.user.name)" $Green
        Write-ColorOutput "📝 Current subscription: $($account.name)" $Blue
    } else {
        throw "Not logged in"
    }
} catch {
    Write-ColorOutput "❌ Not logged in to Azure" $Red
    Write-ColorOutput "Please run: az login" $Yellow
    exit 1
}

# Set subscription if provided
if ($SubscriptionId) {
    Write-ColorOutput "🔄 Setting subscription to: $SubscriptionId" $Yellow
    az account set --subscription $SubscriptionId
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Failed to set subscription" $Red
        exit 1
    }
}

# Display deployment configuration
Write-ColorOutput "`n🎛️ Deployment Configuration:" $Blue
Write-ColorOutput "  • Resource Group: $ResourceGroupName" $Blue
Write-ColorOutput "  • Location: $Location" $Blue
Write-ColorOutput "  • Environment: $EnvironmentName" $Blue
Write-ColorOutput "  • What-If Mode: $WhatIf" $Blue

if ($WhatIf) {
    Write-ColorOutput "`n⚠️ Running in What-If mode - no resources will be created" $Yellow
}

# Confirm deployment
Write-ColorOutput "`n❓ Do you want to proceed with the deployment? (y/N): " $Yellow -NoNewline
$confirm = Read-Host
if ($confirm -notlike "y*") {
    Write-ColorOutput "❌ Deployment cancelled by user" $Red
    exit 0
}

# Create resource group
Write-ColorOutput "`n📦 Creating Resource Group..." $Yellow
$rgCommand = "az group create --name `"$ResourceGroupName`" --location `"$Location`" --tags `"Environment=Development`" `"Project=ContainerWorkshop`" `"DeployedBy=LocalScript`""

if ($WhatIf) {
    Write-ColorOutput "Would run: $rgCommand" $Blue
} else {
    Invoke-Expression $rgCommand
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Resource group created successfully" $Green
    } else {
        Write-ColorOutput "❌ Failed to create resource group" $Red
        exit 1
    }
}

# Deploy infrastructure
Write-ColorOutput "`n🏗️ Deploying Infrastructure..." $Yellow
$deployCommand = @"
az deployment group create \
  --resource-group "$ResourceGroupName" \
  --template-file "infrastructure/bicep/main.bicep" \
  --parameters \
    environmentName="$EnvironmentName" \
    location="$Location" \
    namePrefix="workshop"
"@

if ($WhatIf) {
    $deployCommand += " --what-if"
    Write-ColorOutput "Running What-If deployment..." $Blue
} else {
    Write-ColorOutput "Deploying infrastructure..." $Blue
}

Write-ColorOutput "Command: $deployCommand" $Blue
Invoke-Expression $deployCommand

if ($LASTEXITCODE -eq 0) {
    if ($WhatIf) {
        Write-ColorOutput "✅ What-If deployment completed successfully" $Green
    } else {
        Write-ColorOutput "✅ Infrastructure deployment completed successfully" $Green
        
        # Get deployment outputs
        Write-ColorOutput "`n📊 Getting Deployment Outputs..." $Yellow
        $outputs = az deployment group show --resource-group $ResourceGroupName --name "main" --query "properties.outputs" --output json | ConvertFrom-Json
        
        if ($outputs) {
            Write-ColorOutput "`n🎉 Deployment Summary:" $Green
            Write-ColorOutput "  • Container Registry: $($outputs.containerRegistryName.value)" $Green
            Write-ColorOutput "  • Registry Login Server: $($outputs.containerRegistryLoginServer.value)" $Green
            Write-ColorOutput "  • Environment Name: $($outputs.environmentName.value)" $Green
            Write-ColorOutput "  • Log Analytics: $($outputs.logAnalyticsWorkspaceId.value)" $Green
            
            Write-ColorOutput "`n🔧 Next Steps:" $Blue
            Write-ColorOutput "  1. Build and push container images to the registry" $Blue
            Write-ColorOutput "  2. Deploy container apps using the GitHub Actions workflow" $Blue
            Write-ColorOutput "  3. Test the application endpoints" $Blue
        }
    }
} else {
    Write-ColorOutput "❌ Infrastructure deployment failed" $Red
    exit 1
}

Write-ColorOutput "`n🎊 Script completed successfully!" $Green
