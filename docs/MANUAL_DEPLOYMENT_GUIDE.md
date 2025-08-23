# 🚀 Manual Deployment Guide for Container Workshop

This guide provides step-by-step instructions for workshop participants to manually deploy the Container Apps application using GitHub Actions.

## 📋 Prerequisites

### ✅ **Before Starting - Verify You Have:**
- [x] **GitHub Account** with access to the workshop repository
- [x] **Azure Subscription** with Contributor permissions
- [x] **Workshop Repository** forked to your GitHub account

---

## 🎯 **Phase 1: Initial Setup (One-time only)**

### **Step 1: Fork the Workshop Repository** ⭐
1. **Navigate to the main workshop repository**
2. **Click the "Fork" button** in the top-right corner
3. **Select your GitHub account** as the destination
4. **Wait for the fork to complete**

### **Step 2: Create Azure Service Principal** 🔐
```bash
# Login to Azure CLI
az login

# Set your subscription (replace with your subscription ID)
az account set --subscription "YOUR-SUBSCRIPTION-ID"

# Create service principal for GitHub Actions
az ad sp create-for-rbac \
  --name "containerWorkshop-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID \
  --sdk-auth
```

**📝 Important:** Copy the entire JSON output - you'll need it in the next step!

### **Step 3: Configure GitHub Repository Secret** 🔑
1. **Go to your forked repository** on GitHub
2. **Click "Settings"** (in the repository menu)
3. **Navigate to "Secrets and variables" → "Actions"**
4. **Click "New repository secret"**
5. **Create a secret named `AZURE_CREDENTIALS`**
6. **Paste the complete JSON** from Step 2 as the value
7. **Click "Add secret"**

Example JSON format:
```json
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientSecret": "your-client-secret-here",
  "subscriptionId": "00000000-0000-0000-0000-000000000000",
  "tenantId": "00000000-0000-0000-0000-000000000000"
}
```

---

## 🏗️ **Phase 2: Manual Deployment**

### **Step 4: Navigate to GitHub Actions** 🎬
1. **Go to your forked repository** on GitHub
2. **Click the "Actions" tab** at the top
3. **You should see the workflow**: "Manual Deploy to Azure Container Apps"

### **Step 5: Start Manual Deployment** 🚀
1. **Click on "Manual Deploy to Azure Container Apps"**
2. **Click "Run workflow"** button (on the right side)
3. **Fill in the deployment parameters:**

#### **📝 Deployment Parameters:**

| Parameter | Description | Example Value | Required |
|-----------|-------------|---------------|----------|
| **Resource Group Name** | Where to deploy resources | `containerWorkshop-yourname` | ✅ Yes |
| **Azure Region** | Geographic location | `eastus2` | ✅ Yes |
| **Container Apps Environment Name** | Environment identifier | `workshop-dev-env` | ✅ Yes |
| **Deploy Infrastructure** | Create new resources | `✅ true` (first time) | ✅ Yes |
| **Deploy Applications** | Deploy the apps | `✅ true` | ✅ Yes |

#### **💡 Parameter Guidelines:**

**For First-Time Deployment:**
```yaml
Resource Group Name: containerWorkshop-[yourname]
Azure Region: eastus2
Environment Name: workshop-dev-env
Deploy Infrastructure: ✅ true
Deploy Applications: ✅ true
```

**For Application Updates Only:**
```yaml
Resource Group Name: containerWorkshop-[yourname]  # Same as before
Azure Region: eastus2                              # Same as before
Environment Name: workshop-dev-env                 # Same as before
Deploy Infrastructure: ❌ false                    # Skip infrastructure
Deploy Applications: ✅ true                       # Update apps only
```

### **Step 6: Execute Deployment** ▶️
1. **Review your parameters** carefully
2. **Click "Run workflow"** to start deployment
3. **The workflow will start immediately**

### **Step 7: Monitor Deployment Progress** 👀
1. **Click on the running workflow** to see details
2. **Watch the deployment stages:**
   - ✅ **Deploy Infrastructure** (if selected)
   - ✅ **Deploy Applications** (if selected)

**Expected Timeline:**
- **Infrastructure Deployment**: ~5-8 minutes
- **Application Deployment**: ~3-5 minutes
- **Total Time**: ~8-13 minutes

---

## 📊 **Phase 3: Verification & Testing**

### **Step 8: Verify Deployment Success** ✅
1. **Check the workflow completion** (should show green ✅)
2. **Look for the "Deployment Summary"** at the end
3. **Copy the application URLs** from the workflow output

### **Step 9: Test Your Application** 🧪
1. **Frontend URL**: Click the frontend URL from the workflow output
2. **Backend Health Check**: Add `/health` to the backend URL
3. **Test Features:**
   - ✅ Todo creation and management
   - ✅ Network activity dashboard
   - ✅ Container communication visualization

### **Step 10: Access Azure Portal** 🌐
1. **Login to [Azure Portal](https://portal.azure.com)**
2. **Navigate to your resource group**
3. **Explore the deployed resources:**
   - Container Apps Environment
   - Frontend Container App
   - Backend Container App
   - Container Registry
   - Log Analytics Workspace

---

## 🔄 **Phase 4: Making Updates (Optional)**

### **Step 11: Update Application Code** ✏️
1. **Make changes to your code** (frontend or backend)
2. **Commit and push** to your repository
3. **Run the manual deployment again** with:
   - Deploy Infrastructure: ❌ **false**
   - Deploy Applications: ✅ **true**

### **Step 12: Clean Up Resources** 🧹
When you're done with the workshop:
```bash
# Delete the entire resource group
az group delete --name containerWorkshop-yourname --yes --no-wait
```

---

## 🛠️ **Troubleshooting Common Issues**

### **Issue 1: "Azure CLI Login Failed"**
**Solution:**
- Verify your `AZURE_CREDENTIALS` secret is correctly formatted
- Ensure the service principal has Contributor role
- Check that the subscription ID matches

### **Issue 2: "Resource Group Already Exists"**
**Solution:**
- Use a different resource group name
- Or delete the existing resource group first
- Or use "Deploy Infrastructure: false" if intentional

### **Issue 3: "Container Registry Name Conflict"**
**Solution:**
- The workflow generates unique names automatically
- If issues persist, try a different resource group name

### **Issue 4: "Workflow Permission Denied"**
**Solution:**
- Ensure you're working in your forked repository (not the original)
- Verify GitHub Actions are enabled in your repository settings

### **Issue 5: "Container Apps Not Accessible"**
**Solution:**
- Wait 2-3 minutes after deployment completes
- Check the Azure Portal for any error messages
- Verify the URLs in the workflow output

---

## 📚 **Additional Resources**

### **Azure Portal Navigation:**
- **Resource Groups** → Your resource group → Overview
- **Container Apps** → Your apps → Logs, Metrics, Console
- **Container Registry** → Repositories → Images

### **Useful Azure CLI Commands:**
```bash
# Check deployment status
az group deployment list --resource-group YOUR-RG-NAME

# View container app logs
az containerapp logs show --name workshop-frontend-dev --resource-group YOUR-RG-NAME

# List all resources
az resource list --resource-group YOUR-RG-NAME --output table
```

### **Next Steps:**
- Explore the DAPR components
- Modify the application code
- Try scaling the containers
- Add custom domains
- Implement CI/CD improvements

---

## 🎉 **Success Checklist**

At the end of this guide, you should have:
- ✅ **Working frontend application** with network visualization
- ✅ **Working backend API** with DAPR integration
- ✅ **Container communication** visible in the UI
- ✅ **Azure resources** properly deployed and configured
- ✅ **Understanding** of manual deployment process

**Congratulations! You've successfully deployed a containerized application to Azure Container Apps!** 🎊
