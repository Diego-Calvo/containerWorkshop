# Lab Part 1: Infrastructure Deployment via GitHub Actions

## 🎯 **Objective**
Deploy Azure Container Apps infrastructure using GitHub Actions after forking the repository.

---

## 📋 **Prerequisites** 
- **GitHub account**
- **Azure Subscription** with Contributor permissions
- **Web browser** (no local tools required!)
- **Azure CLI** Administrator User
---

## 🚀 **Lab Steps**

### **Step 1: Fork Repository**
1. **Navigate to**: https://github.com/Diego-Calvo/containerWorkshop
2. **Click "Fork"** in the top-right corner
3. **Select your GitHub account** as the destination
4. **Wait for fork to complete**

### **Step 2: Create Azure Service Principal**

**⚠️ Important**: Due to restrictive organizational policies, the standard service principal creation method may fail. Here are the working alternatives:

**Option A: Personal Azure Subscription (Recommended)**
If you have access to a personal Azure subscription without organizational restrictions:
1. **Go to**: https://shell.azure.com
2. **Switch to personal subscription**: `az account set --subscription "Personal-Subscription-ID"`
3. **Run**:
```powershell
az ad sp create-for-rbac `
  --name "containerWorkshop-github-$env:USERNAME" `
  --role contributor `
  --scopes /subscriptions/$(az account show --query id -o tsv) `
  --years 1
```
This will produce the standard JSON format that works with GitHub Actions.

**Option B: GitHub Codespaces (Browser-Based)**
Use GitHub Codespaces to run the workshop entirely in the browser:
1. **Go to your forked repository** on GitHub
2. **Click "Code"** → **"Codespaces"** → **"Create codespace on dev"**
3. **Install Azure CLI** in the codespace and run the service principal creation
4. This bypasses local organizational restrictions

**Option C: Alternative Azure Account**
If you have access to:
- A different Azure subscription (partner, trial, student, etc.)
- A different organizational tenant with less restrictive policies
- Use that account for the workshop

**Option D: Admin-Assisted Setup (If Available)**
If you can contact your Azure administrator, ask them to run:
```powershell
az ad sp create-for-rbac `
  --name "containerWorkshop-USERNAME" `
  --role contributor `
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID `
  --years 1
```

**Option E: Certificate-Based Workaround (Now Supported)**

If you have Azure CLI access and PowerShell expertise:

1. **Create App Registration**:
```powershell
az ad app create --display-name "containerWorkshop-github-$env:USERNAME"
# Save the appId from the output
```

2. **Create Service Principal**:
```powershell
az ad sp create --id "YOUR-APP-ID-FROM-STEP-1"
```

3. **Create Certificate Credential**:
```powershell
az ad app credential reset --id "YOUR-APP-ID-FROM-STEP-1" --create-cert --end-date "2025-12-01"
```

4. **Assign Role**:
```powershell
az role assignment create `
  --assignee "YOUR-APP-ID-FROM-STEP-1" `
  --role contributor `
  --scope /subscriptions/$(az account show --query id -o tsv)
```

5. **Create JSON for GitHub Actions**:
```powershell
# Use the values from previous steps
$appId = "YOUR-APP-ID-FROM-STEP-1"
$tenantId = "YOUR-TENANT-ID-FROM-STEP-3-OUTPUT"
$subscriptionId = (az account show --query id -o tsv)
$certPath = "YOUR-CERTIFICATE-FILE-PATH-FROM-STEP-3"

# Create the JSON for GitHub Actions
@"
{
  "clientId": "$appId",
  "clientCertificate": "$(Get-Content $certPath -Raw)",
  "subscriptionId": "$subscriptionId",
  "tenantId": "$tenantId"
}
"@
```

**✅ This workflow now supports certificate authentication!** The GitHub Actions workflow has been modified to handle certificate-based login directly with Azure CLI.

**⚠️ Standard Method (May Fail in Enterprise Environments)**
This is the traditional approach, but it will fail with "CredentialInvalidLifetimeAsPerAppPolicy" error in organizations with restrictive policies:

```powershell
# This command will likely FAIL in your environment:
az ad sp create-for-rbac `
  --name "containerWorkshop-github-$env:USERNAME" `
  --role contributor `
  --scopes /subscriptions/$(az account show --query id -o tsv) `
  --years 1
```

**📝 Important**: Copy the entire JSON output! The GitHub Actions workflow requires this **exact format**:

```json
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientSecret": "your-secret-value-here",
  "subscriptionId": "00000000-0000-0000-0000-000000000000",
  "tenantId": "00000000-0000-0000-0000-000000000000"
}
```

**⚠️ Critical**: The workflow uses `azure/login@v1` which **only supports client secrets**, not certificates. If you used Option B (certificate method), you would need to modify the GitHub Actions workflow to use Azure CLI directly instead of the login action.

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
   Azure Region: eastus2 (or westus2, centralus, westeurope, etc.)
   Container Apps Environment Name: workshop-dev-env
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

### **Issue**: "CredentialInvalidLifetimeAsPerAppPolicy" or "Credential lifetime exceeds the max value"
**Root Cause**: Organization policy restricts service principal credential duration
**Practical Solutions**:
1. **Use Personal Azure Subscription** - if available and allowed for workshop
2. **Use GitHub Codespaces** - runs in browser, bypasses local restrictions  
3. **Try Alternative Azure Account** - trial, student, or partner subscriptions
4. **Use Different Tenant** - if you have access to less restrictive organizations
5. **Contact Azure Administrator** - request SP creation (if available)

**Note**: Removing `--years` parameter or using shorter durations typically won't work if the policy is this restrictive.

### **Issue**: "Azure CLI Login Failed" or "Content is not a valid JSON object"
**Root Cause**: The `AZURE_CREDENTIALS` secret contains invalid JSON or wrong authentication format
**Solution**: Verify your `AZURE_CREDENTIALS` secret format matches one of these:

**✅ Option 1: Client Secret Format:**
```json
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientSecret": "your-secret-here",
  "subscriptionId": "00000000-0000-0000-0000-000000000000",
  "tenantId": "00000000-0000-0000-0000-000000000000"
}
```

**✅ Option 2: Certificate Format (Now Supported):**
```json
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientCertificate": "-----BEGIN PRIVATE KEY-----\n...\n-----END CERTIFICATE-----",
  "subscriptionId": "00000000-0000-0000-0000-000000000000",
  "tenantId": "00000000-0000-0000-0000-000000000000"
}
```

**Fix**: Use any of the Options A-E above to get the correct format.

### **Issue**: "Resource Group Already Exists"
**Solution**: Use a different resource group name or delete the existing one

### **Issue**: "Workflow Permission Denied"
**Solution**: Ensure you're in your forked repository (not the original)

**⏱️ Lab Duration**: ~10-15 minutes
