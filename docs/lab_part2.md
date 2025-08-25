# 🏆 Hackathon Part 2: Azure Container Apps Production Challenge

## 🎯 **Mission Brief**
Your basic application is deployed but it's running in **DEMO MODE**! Your mission is to transform it into a production-ready, secure, and scalable system. You have Cosmos DB infrastructure deployed but your application isn't using it yet - it's still using in-memory storage that disappears when containers restart.

---

## 🚨 **Current System Status**
After Lab Part 1, you have:
- ✅ **Infrastructure deployed** (Container Apps, Cosmos DB, Container Registry)
- ✅ **Application running** but with critical limitations:
  - 🟡 **DAPR Status: Demo Mode** (not connected to real persistence)
  - 💾 **Data Storage: In-Memory** (data lost on restart!)
  - 🔓 **Security: Hardcoded credentials** in DAPR components
  - 🚫 **Persistence: Disabled** (Cosmos DB exists but unused)

**Your job**: Fix these production issues!

---

## ⚡ **Hackathon Challenges**

## ⚡ **Hackathon Challenges**

### 🥇 **Challenge 1: Enable Production DAPR** 
**Mission**: Get DAPR working with Cosmos DB for real persistence

**Current Problem**: Your backend has `ENABLE_DAPR = false` hardcoded
**Goal**: Enable DAPR so the app shows "� Production Mode" instead of "🟡 Demo Mode"

**Hints**:
- Check `backend/src/app.js` line ~22 for the DAPR enablement flag
- Look for environment variable `ENABLE_DAPR` 
- Container Apps have environment variable configuration
- Use Azure Portal or Azure CLI to set container app environment variables

**Success Criteria**: 
- Frontend shows "DAPR Status: 🟢 Production Mode"
- Backend logs show "DAPR enabled: true"

---

### 🥈 **Challenge 2: Fix DAPR Component Security**
**Mission**: Replace hardcoded credentials with secure Azure Key Vault integration

**Current Problem**: DAPR components have placeholder passwords and Redis configuration
**Goal**: Configure secure Cosmos DB connection with proper authentication

**Files to investigate**:
```
backend/dapr-components/statestore.yaml  # Currently uses Redis!
infrastructure/bicep/main.bicep          # Has Cosmos DB resources
```

**Hints**:
- Your infrastructure already has Cosmos DB deployed, but DAPR components point to Redis
- Look for `state.azure.cosmosdb` component type in the Bicep file
- DAPR components should be deployed to the Container Apps Environment, not as local files
- Azure Portal > Container Apps Environment > DAPR Components shows current config
- Research: `az containerapp env dapr-component` CLI commands

**Success Criteria**:
- DAPR state store points to Cosmos DB (not Redis)
- No hardcoded passwords in DAPR component configuration
- Data persists after container restarts

---

### � **Challenge 3: Implement Zero-Downtime Persistence**
**Mission**: Verify data survives container restarts and scaling events

**Current Problem**: In-memory storage loses data when pods restart
**Goal**: All todo items persist through restarts, scaling, and redeployments

**Test Scenarios**:
1. Add todo items
2. Restart container app 
3. Scale to 0 and back to 1
4. Redeploy application
5. Verify data persists through all scenarios

**Hints**:
- Use `az containerapp update` to trigger restart
- Use `az containerapp revision` commands for zero-downtime testing
- Check Azure Portal metrics for restart events
- Monitor Cosmos DB Data Explorer for actual data persistence

**Success Criteria**:
- Todo items survive container restarts
- No data loss during scaling events
- Cosmos DB Data Explorer shows stored todo data

---

### 🏅 **Challenge 4: Production Monitoring & Observability**
**Mission**: Implement comprehensive monitoring for production readiness

**Current Problem**: Basic health checks only
**Goal**: Full observability with Application Insights integration

**Monitoring Targets**:
- DAPR sidecar health and metrics
- Cosmos DB connection status and performance
- Container Apps scaling events
- Application performance and errors

**Hints**:
- Application Insights is already deployed in your Bicep template
- Research DAPR observability configuration
- Check Container Apps Environment DAPR configuration for monitoring
- Look into DAPR tracing and metrics collection
- Azure Portal > Application Insights > Live Metrics

**Success Criteria**:
- Application Insights shows DAPR traces
- Cosmos DB metrics visible in Azure Portal
- Custom application metrics tracked
- End-to-end transaction tracing working

---

### 🎖️ **Challenge 5: Advanced Security Hardening**
**Mission**: Implement production-grade security measures

**Security Gaps**:
- Container images running as root
- No network policies
- Missing secrets management
- No resource limits

**Security Objectives**:
1. **Container Security**: Non-root container execution
2. **Network Security**: Proper ingress and VNET integration  
3. **Secrets Management**: Azure Key Vault for all sensitive data
4. **Resource Limits**: Proper CPU/memory constraints

**Hints**:
- Dockerfile security: USER directive, minimal base images
- Container Apps: Security context and resource limits
- VNET integration for Container Apps Environment
- Key Vault references in Container Apps configuration
- Azure Security Center recommendations

**Success Criteria**:
- Containers run as non-root user
- All secrets stored in Azure Key Vault
- Resource limits prevent resource exhaustion
- Network traffic properly isolated

---

### 🚀 **Bonus Challenge: Multi-Region Resilience**
**Mission**: Deploy for global scale and disaster recovery

**Advanced Objectives**:
- Multi-region deployment with traffic distribution
- Cross-region data replication 
- Automated failover mechanisms
- Performance optimization for global users

**Hints**:
- Azure Traffic Manager or Front Door
- Cosmos DB global distribution
- Container Apps in multiple regions
- GitHub Actions matrix strategy for multi-region deployment

---

## 🛠️ **Hackathon Resources**

### **Essential Documentation**
- [DAPR on Azure Container Apps](https://docs.microsoft.com/azure/container-apps/dapr-overview)
- [DAPR State Management](https://docs.dapr.io/developing-applications/building-blocks/state-management/)
- [Container Apps Environment Variables](https://docs.microsoft.com/azure/container-apps/environment-variables)
- [Cosmos DB DAPR Component](https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-azure-cosmosdb/)

### **Key Azure CLI Commands**
```powershell
# View current environment variables
az containerapp show --name workshop-backend-dev --resource-group [your-rg] --query "properties.template.containers[0].env"

# Update environment variables
az containerapp update --name workshop-backend-dev --resource-group [your-rg] --set-env-vars "ENABLE_DAPR=true"

# Check DAPR components
az containerapp env dapr-component list --name [your-environment] --resource-group [your-rg]

# View logs
az containerapp logs show --name workshop-backend-dev --resource-group [your-rg] --follow
```

### **Debugging Tools**
- **Azure Portal**: Container Apps > Logs and Metrics
- **Application Insights**: Live Metrics and Transaction Search  
- **Cosmos DB Data Explorer**: Verify data persistence
- **Container Registry**: Image vulnerability scanning
- **GitHub Actions**: Deployment logs and artifacts

### **Testing Strategies**
```bash
# Test DAPR sidecar
curl https://[backend-url]/health

# Test state persistence  
curl -X POST https://[backend-url]/api/todos -H "Content-Type: application/json" -d '{"text":"Test persistence"}'

# Check Cosmos DB directly
# Use Azure Portal > Cosmos DB > Data Explorer
```

---

## 🎯 **Hackathon Scoring**

| Challenge | Points | Difficulty | Time Estimate |
|-----------|--------|------------|---------------|
| **Challenge 1**: Enable DAPR | 20 pts | ⭐⭐ | 15-30 min |
| **Challenge 2**: Fix Security | 30 pts | ⭐⭐⭐ | 30-60 min |
| **Challenge 3**: Zero-Downtime | 25 pts | ⭐⭐⭐ | 20-45 min |
| **Challenge 4**: Monitoring | 35 pts | ⭐⭐⭐⭐ | 45-90 min |
| **Challenge 5**: Security Hardening | 40 pts | ⭐⭐⭐⭐⭐ | 60-120 min |
| **Bonus**: Multi-Region | 50 pts | ⭐⭐⭐⭐⭐ | 90-180 min |

**Total Possible**: 200 points (250 with bonus)

---

## 🏆 **Victory Conditions**

### **🥉 Bronze Medal** (60+ points)
- DAPR enabled and working
- Basic Cosmos DB persistence
- Data survives restarts

### **🥈 Silver Medal** (120+ points)  
- Secure DAPR configuration
- Comprehensive monitoring
- Production-ready observability

### **🥇 Gold Medal** (180+ points)
- Full security hardening
- Advanced monitoring and alerting
- Enterprise-ready deployment

### **🏆 Platinum Achievement** (230+ points)
- Multi-region deployment
- Disaster recovery capability
- Global scale readiness

---

## 💡 **Getting Stuck? Troubleshooting Tips**

### **DAPR Not Starting**
- Check container app logs for DAPR sidecar errors
- Verify DAPR components are deployed to the environment
- Ensure DAPR app-id matches between frontend and backend

### **Cosmos DB Connection Issues**
- Verify Cosmos DB firewall allows Container Apps
- Check DAPR component configuration syntax
- Validate connection string and authentication

### **Data Not Persisting**
- Confirm DAPR state store is properly configured
- Check if backend is actually calling DAPR APIs
- Verify Cosmos DB container and database exist

### **Performance Issues**
- Review Container Apps resource limits
- Check Cosmos DB request units (RU) throttling
- Monitor Application Insights for bottlenecks

---

## 🧹 **Clean Up** (After Hackathon)
```powershell
# Remove all resources
az group delete --name containerWorkshop-[yourname] --yes --no-wait
```

---

## 🎉 **Ready to Start?**

1. **Check your current deployment** - Visit your app URL from Lab Part 1
2. **Confirm it shows Demo Mode** - This is your starting point
3. **Pick your first challenge** - Start with Challenge 1 for quick wins
4. **Use Azure Portal + GitHub** - No local development tools required!
5. **Ask for help** - Collaboration encouraged for learning

**⏱️ Hackathon Duration**: 2-4 hours  
**🎯 Skills Gained**: DAPR mastery, Azure security, production deployment, observability  
**🏅 Achievement Unlocked**: Azure Container Apps Expert!
