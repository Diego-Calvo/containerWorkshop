# Lab Part 1: Infrastructure Deployment

## 🎯 **Objective**
Deploy Azure Container Apps infrastructure using Bicep templates via local Azure CLI commands.

---

## 📋 **Prerequisites** 
- **Azure CLI** installed and updated
- **Azure Subscription** with Contributor permissions
- **Git** installed
- **PowerShell 7+** (recommended)

**Verify Prerequisites:**
```powershell
az --version          # Should show 2.60.0+
git --version         # Any recent version
$PSVersionTable.PSVersion  # Should show 7.0+
```

---

## 🚀 **Lab Steps**

### **Step 1: Clone Repository**
```bash
# Clone the workshop repository
git clone https://github.com/Diego-Calvo/containerWorkshop.git
cd containerWorkshop
```

### **Step 2: Azure Login & Subscription**
```powershell
# Login to Azure
az login

# Set your subscription
az account set --subscription "YOUR-SUBSCRIPTION-ID"

# Verify subscription
az account show --query "name"
```

### **Step 3: Configure Deployment Parameters**
```powershell
# Edit the parameters file or use defaults
# File: infrastructure/bicep/main.parameters.dev.json

# Default values:
# - resourceGroupName: "containerWorkshop"  
# - location: "eastus2"
# - environmentName: "workshop-dev-env"
# - containerRegistryName: "workshopacr" + random suffix
```

### **Step 4: Deploy Infrastructure**
```powershell
# Navigate to infrastructure directory
cd infrastructure

# Run deployment script
../scripts/deploy-infrastructure.ps1 -ResourceGroupName "containerWorkshop" -Location "eastus2"

# OR deploy manually with Azure CLI
az deployment sub create \
  --location "eastus2" \
  --template-file "bicep/main.bicep" \
  --parameters "@bicep/main.parameters.dev.json"
```

### **Step 5: Verify Deployment**
```powershell
# Check resource group
az group show --name "containerWorkshop"

# List deployed resources  
az resource list --resource-group "containerWorkshop" --output table

# Verify Container Apps Environment
az containerapp env list --resource-group "containerWorkshop" --output table
```

---

## ✅ **Expected Results**

After successful deployment, you should see:
- **Resource Group**: `containerWorkshop`
- **Container Apps Environment**: `workshop-dev-env`  
- **Container Registry**: `workshopacr[random]`
- **Log Analytics Workspace**
- **Application Insights**
- **Cosmos DB Account** (for DAPR state store)

---

## 📊 **Infrastructure Overview**

| Resource Type | Purpose | Configuration |
|---------------|---------|---------------|
| **Container Apps Environment** | Hosts container applications | DAPR enabled, monitoring configured |
| **Azure Container Registry** | Private container image storage | Standard tier, admin enabled |
| **Cosmos DB** | DAPR state store backend | Free tier, single region |
| **Log Analytics** | Centralized logging | 30-day retention |
| **Application Insights** | Application monitoring | Linked to Log Analytics |

---

## 🎯 **Next Steps**
- Proceed to **Lab Part 2** for application deployment
- Infrastructure is now ready for container applications
- DAPR components are pre-configured

**⏱️ Lab Duration**: ~10-15 minutes
