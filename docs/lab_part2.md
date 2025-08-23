# Lab Part 2: Application Deployment & Live Updates

## 🎯 **Objective**
Deploy containerized applications and demonstrate live updates using GitHub Actions.

---

## 📋 **Prerequisites**
- **✅ Lab Part 1 completed** (infrastructure deployed via GitHub Actions)
- **✅ GitHub repository forked** with Azure credentials configured
- **Web browser only** (no local tools required!)

---

## 🚀 **Lab Steps**

### **Step 1: Deploy Applications**
1. **Go to "Actions" tab** in your forked repository
2. **Select**: "Deploy to Azure Container Apps"
3. **Click "Run workflow"**
4. **Configure parameters**:
   ```yaml
   Resource Group Name: containerWorkshop-[yourname]  # Same as Part 1
   Azure Region: eastus2                              # Same as Part 1
   Environment Name: workshop-dev-env                 # Same as Part 1
   Deploy Infrastructure: ❌ false                    # Skip (already done)
   Deploy Applications: ✅ true                       # Deploy containers
   ```
5. **Click "Run workflow"**

### **Step 2: Monitor Application Deployment**
- **Watch the workflow progress** (~3-5 minutes)
- **Look for the URLs** in the workflow output:
  - Frontend URL: `https://workshop-frontend-dev.xxx.eastus2.azurecontainerapps.io`
  - Backend URL: `https://workshop-backend-dev.xxx.eastus2.azurecontainerapps.io`

### **Step 3: Test Your Application**
1. **Open the Frontend URL** from the workflow output
2. **Verify features work**:
   - ✅ Add new todo items
   - ✅ Mark items as complete
   - ✅ Network activity dashboard shows API calls
   - ✅ Container communication visualization
3. **Test Backend API**: Add `/health` to backend URL

---

## 🔄 **Live Development & Updates**

### **Step 4: Make Code Changes (Choose One)**

#### **Option A: Simple Frontend Update**
1. **Go to your repository** → **Code tab**
2. **Navigate to**: `frontend/src/App.js`
3. **Click the edit icon** (pencil)
4. **Find line ~94** with the heading text
5. **Change to**: `<h1>🚀 [Your Name]'s Container Apps Demo</h1>`
6. **Commit directly to main branch**

#### **Option B: Add Backend API Endpoint**
1. **Navigate to**: `backend/src/app.js`
2. **Click edit** and **find line ~185** (after the stats endpoint)
3. **Add this new endpoint**:
   ```javascript
   // Custom greeting endpoint for workshop
   app.get('/api/hello/:name', (req, res) => {
     try {
       const { name } = req.params;
       res.json({ 
         message: `Hello ${name}! Welcome to Azure Container Apps!`,
         workshop: 'Container Apps Demo',
         timestamp: new Date().toISOString(),
         containerHost: process.env.HOSTNAME || 'unknown'
       });
     } catch (error) {
       res.status(500).json({ error: 'Failed to greet' });
     }
   });
   ```
4. **Commit directly to main branch**

### **Step 5: Automatic Redeployment**
1. **Watch the "Actions" tab** - deployment starts automatically!
2. **Monitor the workflow** (~3-5 minutes)
3. **Wait for completion** (green checkmarks)

### **Step 6: Verify Live Updates**
1. **Refresh your application** in the browser
2. **See your changes live**:
   - Frontend: Updated title with your name
   - Backend: Test new endpoint: `BACKEND-URL/api/hello/YourName`

---

## 🧪 **Advanced Exercises** (Optional)

### **Exercise 1: Add Statistics to Frontend**
Add this to `frontend/src/App.js` in the render section:
```javascript
{stats && (
  <div className="stats-summary">
    <p>📊 Total: {stats.total} | ✅ Done: {stats.completed} | ⏳ Pending: {stats.pending}</p>
  </div>
)}
```

### **Exercise 2: Custom API Response**
Modify the health endpoint in `backend/src/app.js`:
```javascript
// Update the health endpoint (around line 170)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    workshop: 'Azure Container Apps Demo',
    student: 'YOUR-NAME-HERE',  // Add your name
    dapr: { enabled: !!process.env.DAPR_ENABLED }
  });
});
```

---

## 📊 **Understanding the Architecture**

```
📱 Frontend (React)          🔗 Backend (Node.js + DAPR)
├─ Network Dashboard    ↔️    ├─ REST API Endpoints
├─ Todo Management            ├─ Health Checks  
├─ Real-time Updates          ├─ Statistics Engine
└─ Container Visualization    └─ DAPR State Management
                                      ↕️
                              💾 Cosmos DB (State Store)
```

### **What Happens During Deployment:**
1. **📦 Container Build**: Docker images created from your code
2. **📤 Registry Push**: Images uploaded to Azure Container Registry
3. **🚀 App Update**: Container Apps pull new images automatically
4. **🔄 Zero Downtime**: Rolling deployment with health checks

---

## 🔧 **Monitoring & Troubleshooting**

### **View Application Logs** (Azure Portal)
1. **Go to**: https://portal.azure.com
2. **Navigate to**: Your resource group → Container App
3. **Select**: "Log stream" or "Logs" 
4. **Monitor**: Real-time application behavior

### **Application Health Checks**
- **Frontend Health**: Should load the todo application
- **Backend Health**: `BACKEND-URL/health` should return JSON
- **API Functionality**: `BACKEND-URL/api/todos` should return todo array

---

## 🎯 **Workshop Success Checklist**

- [ ] ✅ **Infrastructure deployed** via GitHub Actions (Part 1)
- [ ] ✅ **Applications running** and accessible via URLs
- [ ] ✅ **Frontend displays** todo interface with network dashboard
- [ ] ✅ **Backend API responds** to health and todo endpoints
- [ ] ✅ **Code changes made** and committed to repository
- [ ] ✅ **Automatic redeployment** completed successfully
- [ ] ✅ **Live updates verified** in running application

---

## 🧹 **Cleanup** (End of Workshop)
```bash
# In Azure Cloud Shell or local Azure CLI
az group delete --name containerWorkshop-[yourname] --yes --no-wait
```

---

## 🎉 **Congratulations!**

You've successfully:
- 🏗️ **Deployed infrastructure** using GitHub Actions and Bicep
- 🚀 **Containerized and deployed** a two-tier application
- 🔄 **Implemented CI/CD** with automatic deployments
- 📊 **Experienced** Azure Container Apps with DAPR integration
- ⚡ **Made live updates** without any local development tools

**⏱️ Lab Duration**: ~30-45 minutes  
**🎯 Skills Learned**: GitHub Actions, Container Apps, DAPR, CI/CD workflows
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
