# Lab Part 1: Infrastructure Deployment via GitHub Actions

## 🎯 **Objective**
Deploy Azure Container Apps infrastructure using GitHub Actions after forking the repository.

---

## 📋 **Prerequisites** 
- **GitHub account**
- **Azure Subscription** with Contributor permissions
- **Web browser** (no local tools required!)

---

## 🚀 **Lab Steps**

### **Step 1: Fork Repository**
1. **Navigate to**: https://github.com/Diego-Calvo/containerWorkshop
2. **Click "Fork"** in the top-right corner
3. **Select your GitHub account** as the destination
4. **Wait for fork to complete**

### **Step 2: Create Azure Service Principal**
You'll need Azure CLI for this one step. If you don't have it locally, use Azure Cloud Shell:

**Option A: Azure Cloud Shell (Recommended)**
1. **Go to**: https://shell.azure.com
2. **Select Bash or PowerShell**
3. **Run the following commands**:

```bash
# Create service principal for GitHub Actions
az ad sp create-for-rbac \
  --name "containerWorkshop-github-$(whoami)" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv) \
  --sdk-auth
```

**Option B: Local Azure CLI**
```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac \
  --name "containerWorkshop-github" \
  --role contributor \
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID \
  --sdk-auth
```

**📝 Important**: Copy the entire JSON output!

### **Step 3: Configure GitHub Repository Secret**
1. **Go to your forked repository** on GitHub
2. **Click "Settings"** → **"Secrets and variables"** → **"Actions"**
3. **Click "New repository secret"**
4. **Name**: `AZURE_CREDENTIALS`
5. **Value**: Paste the complete JSON from Step 2
6. **Click "Add secret"**

### **Step 4: Deploy Infrastructure via GitHub Actions**
1. **Go to "Actions" tab** in your forked repository
2. **Select**: "Deploy to Azure Container Apps"
3. **Click "Run workflow"**
4. **Configure parameters**:
   ```yaml
   Resource Group Name: containerWorkshop-[yourname]
   Azure Region: eastus2
   Environment Name: workshop-dev-env
   Deploy Infrastructure: ✅ true
   Deploy Applications: ❌ false (Part 2)
   ```
5. **Click "Run workflow"**

### **Step 5: Monitor Deployment**
- **Watch the workflow progress** (~5-8 minutes)
- **Green checkmarks** indicate successful deployment
- **Click on the workflow** to see detailed logs

---

## ✅ **Expected Results**

After successful deployment, you should see in the workflow output:
- **✅ Resource Group Created**: `containerWorkshop-[yourname]`
- **✅ Container Apps Environment**: `workshop-dev-env`  
- **✅ Container Registry**: `workshopacr[random]`
- **✅ Supporting Services**: Log Analytics, Application Insights, Cosmos DB

### **Verify in Azure Portal**
1. **Login to**: https://portal.azure.com
2. **Navigate to**: Your resource group
3. **Confirm resources** match the table below

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
- **✅ Infrastructure deployed successfully!**
- **Proceed to [Lab Part 2](./lab_part2.md)** for application deployment
- **No local tools needed** for the rest of the workshop

---

## 🛠️ **Troubleshooting**

### **Issue**: "Azure CLI Login Failed"
**Solution**: Verify your `AZURE_CREDENTIALS` secret format matches:
```json
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientSecret": "your-secret-here",
  "subscriptionId": "00000000-0000-0000-0000-000000000000",
  "tenantId": "00000000-0000-0000-0000-000000000000"
}
```

### **Issue**: "Resource Group Already Exists"
**Solution**: Use a different resource group name or delete the existing one

### **Issue**: "Workflow Permission Denied"
**Solution**: Ensure you're in your forked repository (not the original)

**⏱️ Lab Duration**: ~10-15 minutes
