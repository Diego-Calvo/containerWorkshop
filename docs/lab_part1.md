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

**Certificate-Based Authentication (Enterprise Solution)**

For enterprise environments with restrictive credential policies, we'll use certificate-based authentication which bypasses password credential restrictions.

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
**📝 Save from the output**: 
- `appId` (if not already saved)
- `tenant` (tenantId)
- `fileWithCertAndPrivateKey` (the full path to the .pem file)

**Example output**:
```json
{
  "appId": "12345678-1234-1234-1234-123456789abc",
  "fileWithCertAndPrivateKey": "C:\\Users\\yourusername\\tmp12345678.pem",
  "password": null,
  "tenant": "87654321-4321-4321-4321-210987654321"
}
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

**📝 Important**: Copy the entire JSON output! This certificate-based format is supported by the GitHub Actions workflow.

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
**Solution**: Use the certificate-based authentication method above, which bypasses password credential restrictions.

### **Issue**: "Azure CLI Login Failed" or "jq: parse error: Invalid string: control characters"
**Root Cause**: The `AZURE_CREDENTIALS` secret contains improperly formatted JSON with unescaped newlines
**Solution**: When creating the certificate JSON, ensure newlines are properly escaped with `\n`:

**❌ Incorrect (causes jq parse error):**
```json
{
  "clientId": "...",
  "clientCertificate": "-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQE...
-----END CERTIFICATE-----",
  "subscriptionId": "...",
  "tenantId": "..."
}
```

**✅ Correct (properly escaped):**
```json
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientCertificate": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQE...\n-----END CERTIFICATE-----",
  "subscriptionId": "00000000-0000-0000-0000-000000000000",
  "tenantId": "00000000-0000-0000-0000-000000000000"
}
```

**Fix**: Use the PowerShell script in Step 5 above, which automatically handles the proper JSON escaping.

### **Issue**: "Resource Group Already Exists"
**Solution**: Use a different resource group name or delete the existing one

### **Issue**: "Workflow Permission Denied"
**Solution**: Ensure you're in your forked repository (not the original)

**⏱️ Lab Duration**: ~10-15 minutes
