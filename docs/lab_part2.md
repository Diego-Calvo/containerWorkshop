# Lab Part 2: Application Deployment & CI/CD

## 🎯 **Objective**
Deploy the containerized applications and set up CI/CD using GitHub Actions manual workflows.

---

## 📋 **Prerequisites**
- **Lab Part 1 completed** (infrastructure deployed)
- **GitHub account** 
- **Docker Desktop** installed and running
- **Node.js 18+** (for local development)

---

## 🚀 **Lab Steps**

### **Step 1: Fork Repository & Setup**
1. **Fork the repository** on GitHub to your account
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/containerWorkshop.git
   cd containerWorkshop
   ```

### **Step 2: Configure GitHub Actions**
```bash
# Create Azure Service Principal for GitHub Actions
az ad sp create-for-rbac \
  --name "containerWorkshop-github" \
  --role contributor \
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID \
  --sdk-auth
```

**Configure GitHub Secret:**
1. Go to your forked repo → **Settings** → **Secrets and variables** → **Actions**
2. Create secret: `AZURE_CREDENTIALS`
3. Paste the JSON output from above command

### **Step 3: Manual Application Deployment**
1. **Go to GitHub** → Your repository → **Actions tab**
2. **Select**: "Deploy to Azure Container Apps"
3. **Click**: "Run workflow"
4. **Configure parameters**:
   ```yaml
   Resource Group Name: containerWorkshop
   Azure Region: eastus2  
   Environment Name: workshop-dev-env
   Deploy Infrastructure: false     # Skip (already done in Part 1)
   Deploy Applications: true        # Deploy containers
   ```
5. **Click**: "Run workflow"

### **Step 4: Monitor Deployment**
- **Watch the workflow progress** (~5-8 minutes)
- **Check for successful completion** (green checkmarks)
- **Copy application URLs** from workflow output

### **Step 5: Test Application**
1. **Frontend**: Open the frontend URL from workflow output
2. **Backend API**: Test health endpoint: `BACKEND-URL/health`
3. **Verify features**:
   - Todo management
   - Network activity dashboard  
   - Container communication visualization

---

## 🔄 **Live Development Workflow**

### **Modify Code & Redeploy**
1. **Edit application code** (frontend or backend)
2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Update: describe your changes"
   git push origin dev
   ```
3. **Automatic deployment** triggers on dev branch push

### **Example Code Changes**

**Frontend Customization** (`frontend/src/App.js`):
```javascript
// Change line ~45
<h1>🚀 [Your Name]'s Container Apps Demo</h1>
```

**Backend API Addition** (`backend/src/app.js`):
```javascript
// Add new endpoint
app.get('/api/hello/:name', (req, res) => {
  res.json({ 
    message: `Hello ${req.params.name}! Welcome to Container Apps!`,
    timestamp: new Date().toISOString()
  });
});
```

---

## 📊 **Application Architecture**

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (React)       │◄──►│   (Node.js)     │
│   Port: 80      │    │   Port: 3001    │
│                 │    │   DAPR Enabled  │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                   │
         ┌─────────────────┐
         │   Cosmos DB     │
         │   (DAPR State)  │
         └─────────────────┘
```

---

## 🔧 **Advanced Operations**

### **Container Scaling**
```bash
# Scale frontend
az containerapp update \
  --name workshop-frontend-dev \
  --resource-group containerWorkshop \
  --min-replicas 1 \
  --max-replicas 5

# Check scaling status
az containerapp show \
  --name workshop-frontend-dev \
  --resource-group containerWorkshop \
  --query "properties.template.scale"
```

### **View Logs**
```bash
# Frontend logs
az containerapp logs show \
  --name workshop-frontend-dev \
  --resource-group containerWorkshop \
  --follow

# Backend logs  
az containerapp logs show \
  --name workshop-backend-dev \
  --resource-group containerWorkshop \
  --follow
```

### **Environment Variables**
```bash
# Update backend environment
az containerapp update \
  --name workshop-backend-dev \
  --resource-group containerWorkshop \
  --set-env-vars "CUSTOM_MESSAGE=Hello from Container Apps!"
```

---

## 🧪 **Hands-On Exercises**

### **Exercise 1**: Add Custom Greeting API
1. Add new endpoint to backend
2. Push to dev branch for automatic deployment
3. Test the new endpoint

### **Exercise 2**: Update Frontend UI
1. Customize the welcome message
2. Add your name to the title
3. Push changes and verify automatic deployment

### **Exercise 3**: Monitor Application
1. Check logs in Azure Portal
2. View metrics and performance
3. Test scaling behavior

---

## 🧹 **Cleanup**
```bash
# Remove all resources
az group delete --name containerWorkshop --yes --no-wait
```

---

## ✅ **Lab Completion Checklist**
- [ ] Repository forked and cloned
- [ ] GitHub Actions configured with Azure credentials
- [ ] Applications deployed via GitHub Actions
- [ ] Frontend application accessible and functional
- [ ] Backend API responding to health checks
- [ ] Container communication visible in UI
- [ ] Code changes trigger automatic deployment
- [ ] Application monitoring and logs reviewed

**⏱️ Lab Duration**: ~30-45 minutes  
**🎯 Skills Learned**: Container Apps deployment, GitHub Actions, DAPR integration, monitoring
