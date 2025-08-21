# Container Workshop Deployment Configuration Template

This template provides easy customization for deploying the Container Workshop to your own Azure subscription.

## 🚀 Quick Setup Guide

### 1. **Fork this Repository**
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/containerWorkshop
cd containerWorkshop
git checkout dev
```

### 2. **Configure Azure Service Principal**
Create a service principal for GitHub Actions deployment:

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "YOUR-SUBSCRIPTION-ID"

# Create service principal
az ad sp create-for-rbac \
  --name "containerWorkshop-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID \
  --sdk-auth
```

### 3. **Setup GitHub Repository Secrets**
Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### Required Secrets:
- **`AZURE_CREDENTIALS`**: Complete JSON output from the service principal creation above

Example `AZURE_CREDENTIALS` format:
```json
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientSecret": "your-client-secret",
  "subscriptionId": "00000000-0000-0000-0000-000000000000",
  "tenantId": "00000000-0000-0000-0000-000000000000"
}
```

### 4. **Configure Repository Variables (Optional)**
Add these repository variables for consistent deployments (Settings → Secrets and variables → Actions → Variables):

#### Repository Variables:
- **`RESOURCE_GROUP_NAME`**: Your preferred resource group name (default: `containerWorkshop`)
- **`AZURE_LOCATION`**: Your preferred Azure region (default: `eastus2`)
- **`ENVIRONMENT_NAME`**: Container Apps environment name (default: `workshop-dev-env`)
- **`CONTAINER_REGISTRY_NAME`**: Registry name prefix (default: auto-generated)

## 🎛️ Deployment Options

### Option 1: Use Default Configuration
Simply push to the `dev` branch and the workflow will deploy with these defaults:
- **Resource Group**: `containerWorkshop`
- **Location**: `eastus2`
- **Environment**: `workshop-dev-env`

### Option 2: Manual Deployment with Custom Settings
Use the workflow dispatch feature:

1. Go to **Actions** tab in your GitHub repository
2. Select **"Deploy to Azure Container Apps (Dev Environment)"**
3. Click **"Run workflow"**
4. Enter your custom values:
   - Resource Group Name
   - Azure Region
   - Environment Name

### Option 3: Configure Repository Variables
Set repository variables for your organization's standards:

```bash
# Example: Set variables using GitHub CLI
gh variable set RESOURCE_GROUP_NAME --body "mycompany-workshop-rg"
gh variable set AZURE_LOCATION --body "westus2"
gh variable set ENVIRONMENT_NAME --body "mycompany-workshop-env"
```

## 🏗️ Infrastructure Components

The deployment creates:

### **Core Infrastructure**
- **Resource Group**: Contains all workshop resources
- **Container Apps Environment**: Isolated environment for your apps
- **Container Registry**: Private registry for your container images
- **Log Analytics Workspace**: Centralized logging and monitoring

### **Application Components**
- **Frontend Container App**: React application with network visualization
- **Backend Container App**: Node.js API with DAPR integration
- **DAPR Components**: State store and pub/sub for microservices communication

### **Security & Monitoring**
- **User-Assigned Managed Identity**: Secure resource access
- **Application Insights**: Application performance monitoring
- **Cosmos DB**: Persistent data storage for production workloads

## 🔧 Customization Examples

### **Multi-Environment Setup**
```yaml
# .github/workflows/deploy-dev.yml - Development
RESOURCE_GROUP_NAME: mycompany-workshop-dev
ENVIRONMENT_NAME: workshop-dev-env

# .github/workflows/deploy-staging.yml - Staging
RESOURCE_GROUP_NAME: mycompany-workshop-staging
ENVIRONMENT_NAME: workshop-staging-env

# .github/workflows/deploy-prod.yml - Production
RESOURCE_GROUP_NAME: mycompany-workshop-prod
ENVIRONMENT_NAME: workshop-prod-env
```

### **Regional Deployments**
```yaml
# East US deployment
AZURE_LOCATION: eastus2
RESOURCE_GROUP_NAME: workshop-eastus

# West Europe deployment
AZURE_LOCATION: westeurope
RESOURCE_GROUP_NAME: workshop-westeu
```

### **Team-Based Deployments**
```yaml
# Team Alpha
RESOURCE_GROUP_NAME: workshop-team-alpha
ENVIRONMENT_NAME: alpha-workshop-env

# Team Beta
RESOURCE_GROUP_NAME: workshop-team-beta
ENVIRONMENT_NAME: beta-workshop-env
```

## 🎯 Resource Naming Convention

The deployment uses this naming pattern:
- **Resource Group**: `{RESOURCE_GROUP_NAME}` (e.g., `containerWorkshop`)
- **Container Registry**: `workshopacr{uniqueString}` (e.g., `workshopacr123abc`)
- **Environment**: `{ENVIRONMENT_NAME}` (e.g., `workshop-dev-env`)
- **Frontend App**: `workshop-frontend-dev`
- **Backend App**: `workshop-backend-dev`

## 📊 Cost Estimation

Estimated monthly costs (East US 2 region):
- **Container Apps Environment**: ~$0 (consumption-based)
- **Container Registry (Basic)**: ~$5/month
- **Log Analytics (Pay-as-you-go)**: ~$2-10/month
- **Container Apps (2 apps, minimal traffic)**: ~$10-30/month
- **Cosmos DB (Free tier eligible)**: ~$0-25/month

**Total estimated cost**: $17-70/month depending on usage

## 🔍 Troubleshooting

### **Common Issues**

1. **Service Principal Permissions**
   ```bash
   # Verify permissions
   az role assignment list --assignee YOUR-CLIENT-ID --output table
   ```

2. **Resource Group Already Exists**
   ```bash
   # Check existing resources
   az group show --name YOUR-RESOURCE-GROUP
   ```

3. **Container Registry Name Conflicts**
   ```bash
   # Check registry name availability
   az acr check-name --name YOUR-REGISTRY-NAME
   ```

4. **Deployment Failures**
   ```bash
   # Check deployment status
   az deployment group list --resource-group YOUR-RESOURCE-GROUP --output table
   ```

### **Support Resources**
- [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)
- [GitHub Actions for Azure](https://docs.microsoft.com/azure/developer/github/)
- [DAPR Documentation](https://docs.dapr.io/)

## 🎉 Success Verification

After successful deployment, you should see:
1. ✅ All resources created in your resource group
2. ✅ Frontend accessible at the generated URL
3. ✅ Backend API responding at `/health` endpoint
4. ✅ Network activity dashboard showing container communication
5. ✅ Container logs available in Azure portal

Your workshop environment is ready! 🚀
