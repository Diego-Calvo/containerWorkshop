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
You'll need Azure CLI for this one step. If you don't have it locally, use Azure Cloud Shell:

**Option A: Azure Cloud Shell (Recommended)**
1. **Go to**: https://shell.azure.com
2. **Select Bash or PowerShell**
3. **Run the following commands**:

```powershell
# Create service principal for GitHub Actions (modern approach)
az ad sp create-for-rbac `
  --name "containerWorkshop-github-$(whoami)" `
  --role contributor `
  --scopes /subscriptions/$(az account show --query id -o tsv) `
  --years 1
```

**Option B: Local Azure CLI**
```powershell
# Login to Azure
az login

# Create service principal (replace YOUR-SUBSCRIPTION-ID with your actual subscription ID)
az ad sp create-for-rbac `
  --name "containerWorkshop-github" `
  --role contributor `
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID `
  --years 1
```

**⚠️ If you get a "CredentialInvalidLifetimeAsPerAppPolicy" error (very restrictive policies):**

**Step 1: Try without --years parameter (uses minimal duration)**
```powershell
az ad sp create-for-rbac `
  --name "containerWorkshop-github" `
  --role contributor `
  --scopes /subscriptions/$(az account show --query id -o tsv)
```

**Step 2: If still fails, contact your Azure Administrator**
```text
Your organization has an extremely restrictive policy.
Ask your Azure admin to:
1. Create the service principal for you with appropriate lifetime
2. Provide the credentials in the required JSON format
3. Or temporarily adjust the policy for workshop purposes
```

**Step 3: Alternative - Use different Azure subscription**
If you have access to a personal Azure subscription or a less restrictive organizational subscription, try using that instead.

**📝 Important**: Copy the entire JSON output!

**🚨 Troubleshooting Service Principal Creation:**

If you encounter **"CredentialInvalidLifetimeAsPerAppPolicy"** error:

**Root Cause**: Your tenant has an App management policy that caps the maximum lifetime for service principal credentials. The Azure CLI default credential lifetime exceeds your organization's policy limit.

**Solution - Try Shorter Credential Lifetime:**
```powershell
# Step 1: Try 1 year
az ad sp create-for-rbac `
  --name "containerWorkshop-github" `
  --role contributor `
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID `
  --years 1

# Step 2: If 1 year fails, try without --years (uses shortest default)
az ad sp create-for-rbac `
  --name "containerWorkshop-github" `
  --role contributor `
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID

# Step 3: If still fails, ask Azure admin to create SP for you
```

**Alternative for Extremely Restrictive Policies:**
If even the minimal duration fails, your organization requires admin intervention:
1. **Contact Azure Administrator** - ask them to create the SP with approved credentials
2. **Use Personal Azure Subscription** - if available and allowed
3. **Request Policy Exception** - for workshop/training purposes

**Option 1: Contact Azure Administrator**
```text
Your organization has a policy limiting service principal credential lifetime.
Contact your Azure administrator to:
1. Create a service principal for you, OR
2. Temporarily adjust the policy for workshop purposes
```

**Option 2: Use Personal Azure Subscription**
```powershell
# If using a personal Azure subscription without restrictive policies
az ad sp create-for-rbac `
  --name "containerWorkshop-github" `
  --role contributor `
  --scopes /subscriptions/YOUR-PERSONAL-SUBSCRIPTION-ID
```

**Option 3: Alternative GitHub OIDC Setup** (Advanced)
```text
For organizations with strict policies, consider using GitHub's 
OpenID Connect (OIDC) integration instead of service principals.
See: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect
```

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

### **Issue**: "CredentialInvalidLifetimeAsPerAppPolicy" or "Credential lifetime exceeds the max value"
**Root Cause**: Organization policy restricts service principal credential duration
**Progressive Solutions**:
1. **Try `--years 1`** - most common policy allows 1 year
2. **Remove `--years` parameter** - uses Azure CLI default (shortest)
3. **Contact Azure Administrator** - request SP creation or policy exception
4. **Use Personal Azure Subscription** - if available and allowed for workshop
5. **Consider GitHub OIDC** - for advanced enterprise scenarios (no SP needed)

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
