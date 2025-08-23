# 🚀 Easy Deployment Customization Guide

This guide shows you how to easily customize the Container Workshop deployment for your own Azure subscription and resource groups.

## 🎯 **Quick Setup for Your Environment**

### **Option 1: Use Repository Variables (Recommended)**
Set these once in your repository and all deployments will use your settings:

1. **Go to your repository** → Settings → Secrets and variables → Actions → Variables
2. **Add these repository variables:**

| Variable Name | Example Value | Description |
|---------------|---------------|-------------|
| `RESOURCE_GROUP_NAME` | `mycompany-workshop` | Your preferred resource group name |
| `AZURE_LOCATION` | `westus2` | Your preferred Azure region |
| `ENVIRONMENT_NAME` | `mycompany-dev-env` | Your container apps environment name |
| `CONTAINER_REGISTRY_NAME` | `mycompanyacr` | Your container registry prefix |

### **Option 2: Manual Workflow Parameters**
Override settings per deployment using the manual workflow:

1. **Go to Actions** → "Deploy to Azure Container Apps"
2. **Click "Run workflow"**
3. **Enter your custom values:**
   - Resource Group Name: `your-resource-group`
   - Azure Region: `your-preferred-region`
   - Environment Name: `your-environment-name`

### **Option 3: Fork and Modify Defaults**
Change the default values in the workflow file:

```yaml
# Edit .github/workflows/deploy-dev.yml
env:
  RESOURCE_GROUP_NAME: ${{ ... || 'YOUR-DEFAULT-RG' }}
  LOCATION: ${{ ... || 'YOUR-DEFAULT-REGION' }}
  ENVIRONMENT_NAME: ${{ ... || 'YOUR-DEFAULT-ENV' }}
```

---

## 🏢 **Multi-Team/Multi-Environment Setup**

### **Team-Based Deployment**
Each team can have their own environment:

```yaml
# Team Alpha
RESOURCE_GROUP_NAME: workshop-team-alpha
ENVIRONMENT_NAME: alpha-dev-env

# Team Beta  
RESOURCE_GROUP_NAME: workshop-team-beta
ENVIRONMENT_NAME: beta-dev-env
```

### **Multi-Environment Setup**
```yaml
# Development
RESOURCE_GROUP_NAME: mycompany-workshop-dev
ENVIRONMENT_NAME: workshop-dev-env

# Staging
RESOURCE_GROUP_NAME: mycompany-workshop-staging
ENVIRONMENT_NAME: workshop-staging-env

# Production
RESOURCE_GROUP_NAME: mycompany-workshop-prod
ENVIRONMENT_NAME: workshop-prod-env
```

---

## 🌍 **Regional Deployment Options**

| Region | Code | Best For |
|--------|------|----------|
| **East US 2** | `eastus2` | US East Coast, lowest latency |
| **West US 2** | `westus2` | US West Coast |
| **Central US** | `centralus` | US Central |
| **West Europe** | `westeurope` | Europe |
| **North Europe** | `northeurope` | Europe (Ireland) |
| **Southeast Asia** | `southeastasia` | Asia Pacific |
| **Australia East** | `australiaeast` | Australia |

---

## 💰 **Cost Optimization Tips**

### **Development Environment**
```yaml
# Minimal resources for development
frontendMinReplicas: 0    # Scale to zero when not used
frontendMaxReplicas: 2
backendMinReplicas: 0     # Scale to zero when not used
backendMaxReplicas: 2
```

### **Production Environment**
```yaml
# Always-on for production
frontendMinReplicas: 2    # Always available
frontendMaxReplicas: 10
backendMinReplicas: 2     # Always available
backendMaxReplicas: 20
```

---

## 🔧 **Advanced Customization**

### **Custom Resource Naming**
Edit `infrastructure/bicep/main.bicep`:
```bicep
param namePrefix string = 'yourcompany'  // Changes workshopacr123 to yourcompanyacr123
```

### **Custom Tags**
Add your organization tags:
```bash
# In the workflow deployment step
--tags \
  "Environment=Development" \
  "Project=ContainerWorkshop" \
  "Team=YourTeam" \
  "CostCenter=YourCostCenter" \
  "Owner=YourEmail"
```

### **Custom Container Apps Settings**
Modify the container app creation commands:
```bash
# More CPU/Memory for your workloads
--cpu 1.0 \
--memory 2Gi \

# Different scaling settings  
--min-replicas 2 \
--max-replicas 10 \

# Custom environment variables
--env-vars \
  "CUSTOM_SETTING=YourValue" \
  "COMPANY_NAME=YourCompany"
```

---

## 🚀 **Quick Start for Your Organization**

### **1. Fork and Configure**
```bash
# Fork the repository
# Add your Azure credentials to GitHub Secrets
# Set repository variables for your defaults
```

### **2. Test Deployment**
```bash
# Push to dev branch or run manual workflow
# Verify deployment with your settings
```

### **3. Share with Your Team**
```bash
# Share your forked repository
# Provide team members with deployment instructions
# Each team member can deploy to their own resource group
```

---

## 📊 **Resource Naming Convention**

With default settings, resources are named:
- **Resource Group**: `containerWorkshop` (or your custom name)
- **Container Registry**: `workshopacr{random}` (globally unique)
- **Environment**: `workshop-dev-env` (or your custom name)
- **Frontend App**: `workshop-frontend-dev`
- **Backend App**: `workshop-backend-dev`

With customization:
- **Resource Group**: `{RESOURCE_GROUP_NAME}`
- **Container Registry**: `{namePrefix}acr{random}`
- **Environment**: `{ENVIRONMENT_NAME}`
- **Frontend App**: `{namePrefix}-frontend-dev`
- **Backend App**: `{namePrefix}-backend-dev`

---

## 🎯 **Success Examples**

### **Microsoft Team Deployment**
```yaml
RESOURCE_GROUP_NAME: msft-container-workshop
AZURE_LOCATION: westus2
ENVIRONMENT_NAME: msft-dev-env
```

### **Startup Company Deployment**
```yaml
RESOURCE_GROUP_NAME: startup-workshop-dev
AZURE_LOCATION: eastus2
ENVIRONMENT_NAME: startup-dev-env
```

### **University Class Deployment**
```yaml
RESOURCE_GROUP_NAME: university-cs410-workshop
AZURE_LOCATION: centralus
ENVIRONMENT_NAME: cs410-dev-env
```

---

**🎉 Ready to deploy? Your customized environment will be ready in ~10-15 minutes!**
