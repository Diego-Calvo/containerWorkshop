# Azure Container Apps Workshop - Application Deployment Guide

## 📋 Overview
This guide covers **Part 2** of the workshop - deploying and updating the two-tier application to existing Azure Container Apps infrastructure.

## 🔧 Prerequisites & Infrastructure Setup

### **Required Infrastructure (Pre-deployed)**
- ✅ Azure Container Apps Environment created
- ✅ Two Container Apps created: `workshop-frontend` and `workshop-backend`
- ✅ Azure Container Registry (ACR) provisioned
- ✅ DAPR components configured
- ✅ Resource group and networking setup complete

### **Development Environment Requirements**

#### **Local Development Tools**
```powershell
# Required software installations
# 1. Azure CLI (latest version)
az --version
# Expected: azure-cli 2.60.0+

# 2. Docker Desktop (with Linux containers)
docker --version
# Expected: Docker version 24.0.0+

# 3. Git (for source control)
git --version
# Expected: git version 2.40.0+

# 4. Node.js (for local development)
node --version
npm --version
# Expected: Node.js v18.20.0+, npm 10.0.0+

# 5. PowerShell 7+ (recommended)
$PSVersionTable.PSVersion
# Expected: 7.3.0+
```

#### **Azure Account Requirements**
- Active Azure subscription with Contributor role
- Azure CLI authenticated and configured
- Access to workshop resource group
- Container Registry push/pull permissions

### **🎛️ DAPR Component Configuration Details**

#### **State Store Component (Redis)**
The workshop uses Redis as the state store for persistent data management:

```yaml
# File: backend/dapr-components/statestore.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis:6379
  - name: redisPassword
    value: ""
  - name: enableTLS
    value: false
  - name: redisDB
    value: "0"
  - name: maxRetries
    value: "3"
  - name: maxRetryBackoff
    value: "2s"
scopes:
- workshop-api
```

**Configuration Details:**
- **Component Type:** `state.redis` - Redis-based state management
- **Version:** `v1` - Stable DAPR Redis component version
- **Redis Host:** `redis:6379` - Docker Compose service name and port
- **Security:** No TLS/password for local development
- **Database:** Uses Redis DB 0 (default)
- **Retry Logic:** Max 3 retries with 2-second backoff
- **Scopes:** Limited to `workshop-api` application

#### **Pub/Sub Component (Redis)**
Event-driven communication between microservices:

```yaml
# File: backend/dapr-components/pubsub.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis:6379
  - name: redisPassword
    value: ""
  - name: enableTLS
    value: false
  - name: consumerID
    value: workshop-consumer
  - name: processingTimeout
    value: "15s"
  - name: redeliverInterval
    value: "60s"
scopes:
- workshop-api
```

**Configuration Details:**
- **Component Type:** `pubsub.redis` - Redis-based publish/subscribe
- **Consumer ID:** `workshop-consumer` - Unique identifier for message processing
- **Processing Timeout:** 15 seconds - Max time for message processing
- **Redelivery:** 60-second interval for failed messages
- **Reliability:** Ensures message delivery with retry mechanisms

### **🚀 Azure Container Apps DAPR Configuration**

#### **Environment-Level DAPR Setup**
When deploying to Azure Container Apps, DAPR components are configured at the environment level:

```bash
# Create DAPR state store component in Azure
az containerapp env dapr-component set \
  --name workshop-env \
  --resource-group workshop-rg \
  --dapr-component-name statestore \
  --yaml "
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.azure.cosmosdb
  version: v1
  metadata:
  - name: url
    value: 'COSMOS_DB_ENDPOINT'
  - name: masterKey
    secretRef: cosmos-key
  - name: database
    value: 'workshopdb'
  - name: collection
    value: 'todos'
scopes:
- workshop-backend
"

# Create DAPR pub/sub component in Azure
az containerapp env dapr-component set \
  --name workshop-env \
  --resource-group workshop-rg \
  --dapr-component-name pubsub \
  --yaml "
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.azure.servicebus
  version: v1
  metadata:
  - name: connectionString
    secretRef: servicebus-connection
scopes:
- workshop-backend
"
```

#### **Container App DAPR Integration**
Backend application configuration with DAPR sidecar:

```bash
# Backend container app with DAPR enabled
az containerapp create \
  --name workshop-backend \
  --resource-group workshop-rg \
  --environment workshop-env \
  --image workshop.azurecr.io/backend:latest \
  --target-port 3001 \
  --ingress external \
  --enable-dapr \
  --dapr-app-id workshop-api \
  --dapr-app-port 3001 \
  --dapr-app-protocol http \
  --env-vars \
    "DAPR_ENABLED=true" \
    "DAPR_APP_PORT=3001" \
    "NODE_ENV=production"
```

**DAPR Configuration Parameters:**
- **`--enable-dapr`:** Enables DAPR sidecar injection
- **`--dapr-app-id`:** Unique identifier matching component scopes
- **`--dapr-app-port`:** Port where your app listens
- **`--dapr-app-protocol`:** Communication protocol (http/grpc)

### **📊 Environment Variables & Secrets**

#### **Local Development (.env)**
```env
# DAPR Configuration
DAPR_ENABLED=false
DAPR_APP_PORT=3001
DAPR_HTTP_PORT=3500
DAPR_GRPC_PORT=50001

# Application Settings
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Redis Connection (Local)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=""
```

#### **Azure Container Apps Environment**
```bash
# Set environment variables for production
az containerapp update \
  --name workshop-backend \
  --resource-group workshop-rg \
  --set-env-vars \
    "DAPR_ENABLED=true" \
    "NODE_ENV=production" \
    "CORS_ORIGIN=https://workshop-frontend.domain.com"

# Set secrets for sensitive data
az containerapp secret set \
  --name workshop-backend \
  --resource-group workshop-rg \
  --secrets \
    cosmos-key="YOUR_COSMOS_DB_KEY" \
    servicebus-connection="YOUR_SERVICEBUS_CONNECTION_STRING"
```

### **🔍 DAPR Component Verification**

#### **Local Testing Commands**
```powershell
# Check DAPR components status
dapr components --kubernetes

# Test state store connectivity
curl http://localhost:3500/v1.0/state/statestore

# Test pub/sub subscription
curl http://localhost:3500/v1.0/publish/pubsub/todo-events \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# View DAPR sidecar logs
docker logs dapr_workshop-api_1
```

#### **Azure Testing Commands**
```bash
# List DAPR components in environment
az containerapp env dapr-component list \
  --name workshop-env \
  --resource-group workshop-rg \
  --output table

# Check container app DAPR status
az containerapp show \
  --name workshop-backend \
  --resource-group workshop-rg \
  --query "properties.configuration.dapr"

# View application logs with DAPR traces
az containerapp logs show \
  --name workshop-backend \
  --resource-group workshop-rg \
  --follow
```

---

## 🎯 Workshop Objectives
By the end of this session, participants will:
- Deploy containerized applications to Azure Container Apps
- Understand the build-push-deploy workflow
- Experience real-time application updates
- Work with DAPR-enabled microservices
- Practice container troubleshooting

---

## 📚 Step-by-Step Instructions

### Step 1: Environment Setup (5 minutes)

#### For Participants:
1. **Fork the Workshop Repository**
   ```bash
   # Navigate to GitHub and fork the repository
   # Then clone your fork
   git clone https://github.com/YOUR-USERNAME/containerAppWorkshop
   cd containerAppWorkshop
   ```

2. **Verify Prerequisites**
   ```powershell
   # Check Azure CLI
   az --version
   
   # Check Docker
   docker --version
   docker ps
   
   # Check Git
   git --version
   ```

3. **Azure Login and Subscription**
   ```powershell
   # Login to Azure
   az login
   
   # Set subscription (provided by instructor)
   az account set --subscription "SUBSCRIPTION-ID-PROVIDED"
   ```

#### For Instructor:
- Provide participants with:
  - Azure subscription ID
  - Resource group name
  - Container registry name
  - Any required access credentials

---

### Step 2: Configure Workshop Settings (3 minutes)

1. **Create Configuration File**
   ```powershell
   # Create a .workshop-config.json file with your assigned values
   $config = @{
       resourceGroupName = "workshop-rg-YOURNAME"
       containerRegistryName = "workshopacr123"
       environmentName = "workshop-env"
       containerRegistryLoginServer = "workshopacr123.azurecr.io"
   }
   $config | ConvertTo-Json | Out-File -FilePath ".workshop-config.json" -Encoding UTF8
   ```

2. **Verify Container Apps Exist**
   ```powershell
   # Check if your container apps are ready
   az containerapp list --resource-group "workshop-rg-YOURNAME" --output table
   ```

   Expected output:
   ```
   Name               Location    ResourceGroup      Status    
   workshop-backend   East US     workshop-rg-...    Running
   workshop-frontend  East US     workshop-rg-...    Running
   ```

---

### Step 3: First Application Deployment (10 minutes)

#### 3.1 Login to Container Registry
```powershell
# Login to Azure Container Registry
az acr login --name "workshopacr123"
```

#### 3.2 Build and Push Containers
```powershell
# Build frontend container
Write-Host "🏗️ Building frontend..." -ForegroundColor Yellow
docker build -t workshopacr123.azurecr.io/workshop-frontend:latest ./frontend

# Build backend container  
Write-Host "🏗️ Building backend..." -ForegroundColor Yellow
docker build -t workshopacr123.azurecr.io/workshop-backend:latest ./backend

# Push both containers
Write-Host "📤 Pushing containers..." -ForegroundColor Yellow
docker push workshopacr123.azurecr.io/workshop-frontend:latest
docker push workshopacr123.azurecr.io/workshop-backend:latest
```

#### 3.3 Deploy to Container Apps
```powershell
# Update backend container app
az containerapp update \
    --name "workshop-backend" \
    --resource-group "workshop-rg-YOURNAME" \
    --image "workshopacr123.azurecr.io/workshop-backend:latest"

# Update frontend container app
az containerapp update \
    --name "workshop-frontend" \
    --resource-group "workshop-rg-YOURNAME" \
    --image "workshopacr123.azurecr.io/workshop-frontend:latest"
```

#### 3.4 Get Application URLs
```powershell
# Get frontend URL
$frontendUrl = az containerapp show --name "workshop-frontend" --resource-group "workshop-rg-YOURNAME" --query "properties.configuration.ingress.fqdn" -o tsv

# Get backend URL
$backendUrl = az containerapp show --name "workshop-backend" --resource-group "workshop-rg-YOURNAME" --query "properties.configuration.ingress.fqdn" -o tsv

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "Frontend: https://$frontendUrl" -ForegroundColor Cyan
Write-Host "Backend:  https://$backendUrl" -ForegroundColor Cyan
```

#### 3.5 Test Your Application
1. **Open Frontend URL** in your browser
2. **Test Todo Application**:
   - Add a new todo item
   - Mark items as complete
   - Verify real-time updates
3. **Test Backend API**:
   - Visit: `https://YOUR-BACKEND-URL/health`
   - Visit: `https://YOUR-BACKEND-URL/api/stats`

---

### Step 4: Live Development Exercise (15 minutes)

#### Exercise 4.1: Personalize Your Application

1. **Modify Frontend Title**
   ```javascript
   // Edit: frontend/src/App.js (line ~45)
   <h1>🚀 [Your Name]'s Container Apps Demo</h1>
   <h2>📝 My Personal Todo Manager</h2>
   ```

2. **Add Custom API Endpoint**
   ```javascript
   // Edit: backend/src/app.js (add after line ~180)
   
   // Custom hello endpoint for workshop
   app.get('/api/hello/:name', (req, res) => {
     try {
       const { name } = req.params;
       res.json({ 
         message: `Hello ${name}! Welcome to Azure Container Apps!`,
         workshop: 'Container Apps Demo',
         timestamp: new Date().toISOString(),
         yourName: name
       });
     } catch (error) {
       res.status(500).json({ error: 'Failed to greet' });
     }
   });
   ```

3. **Quick Deploy Script**
   ```powershell
   # Use the provided deployment script
   ./scripts/build-and-deploy.ps1
   ```

4. **Verify Changes**
   - Refresh your browser
   - Test new endpoint: `https://YOUR-BACKEND-URL/api/hello/YourName`

#### Exercise 4.2: Add Real-time Statistics

1. **Update Frontend to Show Stats**
   ```javascript
   // Add to frontend/src/App.js in the useEffect section
   
   const fetchStats = async () => {
     try {
       const response = await fetch(`${API_BASE}/api/stats`);
       const stats = await response.json();
       setStats(stats);
     } catch (error) {
       console.error('Error fetching stats:', error);
     }
   };
   
   // Add stats display in the render section
   {stats && (
     <div className="stats-display">
       <p>📊 Total: {stats.total} | ✅ Done: {stats.completed} | ⏳ Pending: {stats.pending}</p>
       <p>🔧 DAPR: {stats.daprEnabled ? 'Enabled' : 'Disabled'} | 📅 Version: {stats.version}</p>
     </div>
   )}
   ```

2. **Deploy and Test**
   ```powershell
   ./scripts/build-and-deploy.ps1
   ```

---

### Step 5: Container Apps Features Demo (10 minutes)

#### 5.1 Monitor Application Health

```powershell
# Check container app status
az containerapp show --name "workshop-backend" --resource-group "workshop-rg-YOURNAME" --query "properties.runningStatus"

# View logs
az containerapp logs show --name "workshop-backend" --resource-group "workshop-rg-YOURNAME" --follow
```

#### 5.2 Scale Application

```powershell
# Check current scaling
az containerapp show --name "workshop-frontend" --resource-group "workshop-rg-YOURNAME" --query "properties.template.scale"

# Update scaling rules
az containerapp update \
    --name "workshop-frontend" \
    --resource-group "workshop-rg-YOURNAME" \
    --min-replicas 1 \
    --max-replicas 5
```

#### 5.3 View DAPR Integration

```powershell
# Check DAPR configuration
az containerapp show --name "workshop-backend" --resource-group "workshop-rg-YOURNAME" --query "properties.configuration.dapr"

# Test DAPR state store (via API)
curl "https://YOUR-BACKEND-URL/api/stats"
```

---

### Step 6: Troubleshooting & Monitoring (5 minutes)

#### Common Issues and Solutions:

1. **Container not starting:**
   ```powershell
   # Check logs
   az containerapp logs show --name "workshop-backend" --resource-group "workshop-rg-YOURNAME" --tail 50
   ```

2. **Build failures:**
   ```powershell
   # Clear Docker cache
   docker system prune -f
   
   # Rebuild with verbose output
   docker build --no-cache -t workshopacr123.azurecr.io/workshop-frontend:latest ./frontend
   ```

3. **API not responding:**
   ```powershell
   # Check health endpoint
   curl "https://YOUR-BACKEND-URL/health"
   
   # Check app status
   az containerapp show --name "workshop-backend" --resource-group "workshop-rg-YOURNAME" --query "properties.runningStatus"
   ```

#### Monitoring Commands:
```powershell
# Real-time logs
az containerapp logs show --name "workshop-backend" --resource-group "workshop-rg-YOURNAME" --follow

# Container app metrics
az monitor metrics list --resource "/subscriptions/SUB-ID/resourceGroups/workshop-rg-YOURNAME/providers/Microsoft.App/containerApps/workshop-backend"

# Check revisions
az containerapp revision list --name "workshop-backend" --resource-group "workshop-rg-YOURNAME" --output table
```

---

## 🎯 Workshop Exercises Summary

### Exercise Checklist:
- [ ] **Exercise 1**: Deploy initial application
- [ ] **Exercise 2**: Personalize frontend and add custom API
- [ ] **Exercise 3**: Add real-time statistics display
- [ ] **Exercise 4**: Test scaling and monitoring
- [ ] **Exercise 5**: Troubleshoot a simulated issue

### Advanced Challenges (Optional):
- [ ] Add environment-specific configurations
- [ ] Implement rolling deployments
- [ ] Add custom DAPR components
- [ ] Configure custom domains
- [ ] Set up monitoring alerts

---

## 🧹 Cleanup (End of Workshop)

**Important**: Only run cleanup if you own the resources!

```powershell
# Remove your resource group (instructor will confirm)
az group delete --name "workshop-rg-YOURNAME" --yes --no-wait

# Clean up local Docker images
docker rmi workshopacr123.azurecr.io/workshop-frontend:latest
docker rmi workshopacr123.azurecr.io/workshop-backend:latest
```

---

## 📞 Getting Help During Workshop

| Issue | Solution |
|-------|----------|
| 🔐 Can't login to Azure | Ask instructor for credentials |
| 🐳 Docker not working | Restart Docker Desktop |
| 🏗️ Build failing | Check error messages, ask for help |
| 🌐 App not loading | Wait 2-3 minutes for deployment |
| 📱 Frontend broken | Check browser console for errors |
| 🔧 API not responding | Check backend logs with instructor |

---

## 📚 Additional Resources

- [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)
- [DAPR Documentation](https://docs.dapr.io/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Azure CLI Container Apps Reference](https://docs.microsoft.com/cli/azure/containerapp)

---

**⏱️ Total Workshop Time**: ~45 minutes  
**🎯 Skill Level**: Beginner to Intermediate  
**🛠️ Technologies**: Azure Container Apps, Docker, React, Node.js, DAPR

#### For Instructors
- Azure subscription with Contributor access
- Azure CLI installed and configured
- Docker Desktop installed and running
- PowerShell 5.1+ or PowerShell Core 7+
- Git client

#### For Participants
- GitHub account for forking the repository
- Azure CLI installed and configured
- Docker Desktop installed and running
- Node.js 18+ (for local development)
- Code editor (VS Code recommended)

### Workshop Repository Setup

1. **Instructor Setup** (Pre-workshop)
   ```bash
   git clone <this-repository>
   cd containerAppWorkshop
   ```

2. **Participant Setup** (During workshop)
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/YOUR-USERNAME/containerAppWorkshop
   cd containerAppWorkshop
   ```

## 📋 Workshop Delivery Guide

### Part 1: Infrastructure Setup (45 minutes)
*Delivered by co-presenter*

#### 1.1 Azure Container Apps Overview (10 minutes)
- Container Apps vs other Azure compute services
- DAPR integration benefits
- Scaling and ingress capabilities
- Pricing model

#### 1.2 Infrastructure Deployment (30 minutes)
```powershell
# Deploy the complete infrastructure
./infrastructure/scripts/setup-environment.ps1 -ResourceGroupName "workshop-rg" -Location "eastus"
```

**Components Deployed:**
- Container Apps Environment
- Azure Container Registry
- Log Analytics Workspace
- Application Insights
- Cosmos DB (for DAPR state store)
- User-assigned Managed Identity
- DAPR components configuration

#### 1.3 Infrastructure Review (5 minutes)
- Review deployed resources in Azure Portal
- Explain resource relationships
- Show Container Apps Environment dashboard

### Part 2: Application Deployment (75 minutes)
*Your delivery section*

#### 2.1 Application Overview (10 minutes)
- Review the two-tier architecture
- Examine frontend React application
- Explore backend Node.js API with DAPR
- Understanding container configurations

#### 2.2 Container Build and Deploy (25 minutes)

**Step 1: Fork and Clone Repository**
```bash
# Participants fork the repo and clone their copy
git clone https://github.com/PARTICIPANT-USERNAME/containerAppWorkshop
cd containerAppWorkshop
```

**Step 2: Deploy Application**
```powershell
# Use the automated deployment script
./scripts/build-and-deploy.ps1
```

**What happens during deployment:**
1. Docker builds frontend container (React + nginx)
2. Docker builds backend container (Node.js + DAPR ready)
3. Images pushed to Azure Container Registry
4. Container Apps updated with new images
5. Applications automatically restart with new versions

#### 2.3 Test the Application (10 minutes)

**Frontend Testing:**
- Open the frontend URL
- Add todo items
- Verify backend communication
- Check browser developer tools for API calls

**Backend API Testing:**
```bash
# Health check
curl https://YOUR-BACKEND-URL/health

# Get todos
curl https://YOUR-BACKEND-URL/api/todos

# Get statistics
curl https://YOUR-BACKEND-URL/api/stats
```

#### 2.4 Hands-On Exercises (30 minutes)

##### Exercise 1: Add New API Endpoint (10 minutes)
Modify `backend/src/app.js` to add a new endpoint:

```javascript
// Add this endpoint in the backend
app.get('/api/greeting/:name', (req, res) => {
  const { name } = req.params;
  res.json({ 
    message: `Hello ${name} from Azure Container Apps!`,
    timestamp: new Date().toISOString(),
    workshop: 'Azure Container Apps'
  });
});
```

Test the deployment:
```powershell
./scripts/build-and-deploy.ps1
```

##### Exercise 2: Update Frontend UI (10 minutes)
Modify `frontend/src/App.js` to change the welcome message:

```javascript
// Change the title in the App component
<h1>🚀 [Your Name]'s Container Apps Workshop</h1>
<h2>📝 Todo Manager - Live Updates Demo</h2>
```

##### Exercise 3: Add Environment Information (10 minutes)
Display backend version information in the frontend:

```javascript
// Add this state and effect in App.js
const [backendInfo, setBackendInfo] = useState(null);

useEffect(() => {
  fetch(`${API_BASE}/health`)
    .then(response => response.json())
    .then(data => setBackendInfo(data))
    .catch(error => console.error('Error fetching backend info:', error));
}, []);

// Display in the UI
{backendInfo && (
  <div className="backend-info">
    <p>Backend Version: {backendInfo.version}</p>
    <p>DAPR Enabled: {backendInfo.dapr.enabled ? '✅' : '❌'}</p>
  </div>
)}
```

## 🔧 Advanced Topics (Optional - 30 minutes)

### Scaling Configuration
```bash
# Manual scaling
az containerapp update \
  --name workshop-backend \
  --resource-group workshop-rg \
  --min-replicas 2 \
  --max-replicas 10

# View scaling rules
az containerapp show \
  --name workshop-backend \
  --resource-group workshop-rg \
  --query "properties.template.scale"
```

### Monitoring and Logging
```bash
# View logs
az containerapp logs show \
  --name workshop-backend \
  --resource-group workshop-rg \
  --follow

# View metrics in Application Insights
# (Demo in Azure Portal)
```

### DAPR State Store Usage
Show how the backend uses DAPR for state management:

```javascript
// Example of DAPR state operations in the backend
const daprClient = new DaprClient();

// Save state
await daprClient.state.save('statestore', [
  { key: 'todos', value: todoList }
]);

// Get state
const todos = await daprClient.state.get('statestore', 'todos');
```

## 🧪 Workshop Exercises Summary

### Exercise 1: Basic Deployment
- Fork repository
- Deploy infrastructure
- Build and deploy application
- Test functionality

### Exercise 2: Live Updates
- Modify API endpoint
- Update frontend UI
- Deploy changes
- Observe live updates

### Exercise 3: Monitoring
- View application logs
- Check health endpoints
- Monitor scaling behavior
- Review Application Insights

### Exercise 4: Advanced Configuration
- Modify scaling rules
- Update environment variables
- Configure custom domains (if time permits)

## 🎯 Learning Outcomes

By the end of this workshop, participants will:
1. ✅ Understand Azure Container Apps core concepts
2. ✅ Deploy multi-container applications
3. ✅ Use DAPR for state management
4. ✅ Implement CI/CD for container updates
5. ✅ Monitor and troubleshoot applications
6. ✅ Configure scaling and performance

## 📚 Additional Resources

### Documentation
- [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)
- [DAPR Documentation](https://docs.dapr.io/)
- [Container Apps Best Practices](https://docs.microsoft.com/azure/container-apps/scale-app)

### Troubleshooting
- [Common Issues and Solutions](./troubleshooting.md)
- [Container Apps FAQ](https://docs.microsoft.com/azure/container-apps/faq)

### Next Steps
- Implement authentication with Azure AD
- Add custom domains and SSL certificates
- Integrate with Azure Service Bus
- Implement blue-green deployments

## 🤝 Workshop Feedback

After the workshop, please collect feedback on:
- Content clarity and pacing
- Hands-on exercise difficulty
- Technical setup issues
- Suggested improvements

---

**Workshop Version**: 1.0.0  
**Last Updated**: August 2025  
**Estimated Duration**: 2-3 hours
