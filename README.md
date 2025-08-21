# Azure Container Apps Workshop

A comprehensive hands-on workshop for Azure Container Apps featuring a modern two-tier application with sleek UI and real-time DAPR integration.

## ✨ Features

🎨 **Modern React Frontend**
- Glass morphism design with smooth animations
- Real-time network activity visualization dashboard
- Container communication tracking and display
- Interactive filtering and CRUD operations
- Mobile-responsive design with auto-refresh

🚀 **High-Performance Backend**
- Node.js Express API with DAPR integration
- Optimized for both local development and Azure Container Apps
- RESTful endpoints with comprehensive error handling
- Health checks and monitoring endpoints
- Smart DAPR configuration (enabled in Azure, disabled locally for performance)

⚡ **Performance Optimized**
- Sub-100ms API response times
- Efficient container orchestration with network visualization
- CORS properly configured
- Production-ready Docker setup

🎯 **Workshop Learning Goals**
- Hands-on Azure Container Apps deployment
- GitHub Actions manual deployment workflow
- Infrastructure as Code with Bicep templates
- DAPR microservices communication
- Container networking and monitoring

## 🚀 Quick Start for Workshop Participants

### **Option 1: Manual Deployment (Recommended for Learning)**
📚 **[Follow the Complete Manual Deployment Guide](./MANUAL_DEPLOYMENT_GUIDE.md)**

**Quick Summary:**
1. Fork this repository
2. Create Azure Service Principal
3. Add GitHub secret: `AZURE_CREDENTIALS`
4. Run workflow: "Manual Deploy to Azure Container Apps"
5. Test your deployed application!

### **Option 2: Local Development**
```bash
# Clone and start locally
git clone https://github.com/YOUR-USERNAME/containerWorkshop
cd containerWorkshop
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📚 Documentation

- 📖 **[Manual Deployment Guide](./MANUAL_DEPLOYMENT_GUIDE.md)** - Step-by-step workshop instructions
- 🏗️ **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Advanced deployment options and configuration
- 📋 **[Workshop Guide](./docs/workshop-guide.md)** - Detailed DAPR components and prerequisites

## 🏗️ Architecture Overview

**Two-Tier Application:**
- **Frontend (Tier 1)**: React application with modern UI served via nginx
- **Backend (Tier 2)**: Node.js API with conditional DAPR integration for state management

## 📁 Project Structure

```
containerAppWorkshop/
├── README.md                           # This file
├── frontend/                          # React frontend application
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/                           # Node.js API backend
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── dapr-components/
├── infrastructure/                    # Infrastructure as Code
│   ├── bicep/
│   │   ├── main.bicep
│   │   └── modules/
│   └── scripts/
│       ├── deploy.ps1
│       └── setup-environment.ps1
├── .github/
│   ├── workflows/                     # CI/CD pipelines
│   └── copilot-instructions.md
├── docs/                             # Workshop documentation
│   └── workshop-guide.md
└── scripts/                          # Deployment and utility scripts
    ├── build-and-deploy.ps1
    └── test-local.ps1
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed
- Azure CLI installed and configured (for Azure deployment)
- Azure subscription with Container Apps access (for cloud deployment)

### Local Development (Recommended for testing)

1. **Clone and start the application**
   ```powershell
   git clone <repository-url>
   cd containerWorkshop
   docker-compose up --build -d
   ```

2. **Access the application**
   - Frontend: http://localhost:3000 (Modern React UI with glass morphism design)
   - Backend API: http://localhost:3001 (Node.js with health checks)
   - API Documentation: http://localhost:3001/health

3. **Test the application**
   ```powershell
   # Test local development setup
   .\scripts\test-local.ps1
   ```

### Azure Container Apps Deployment

1. **Infrastructure Setup**
   ```powershell
   ./infrastructure/scripts/setup-environment.ps1 -ResourceGroupName "workshop-rg" -Location "eastus"
   ```

2. **Application Deployment**
   ```powershell
   ./scripts/build-and-deploy.ps1 -RegistryName "workshopacr" -Environment "workshop-env"
   ```

## ⚡ Performance Features

- **Fast API Response**: Sub-100ms response times
- **Smart DAPR Integration**: Enabled in Azure, optimized for local development
- **Real-time Updates**: Frontend auto-refreshes every 10 seconds
- **Modern UI**: Glass morphism design with smooth animations

## 🎯 Learning Objectives

- Understand Azure Container Apps architecture
- Deploy multi-container applications
- Implement DAPR for microservices communication
- Configure ingress and scaling policies
- Practice CI/CD with Container Apps
- Monitor and troubleshoot containerized applications

## 🛠️ Workshop Exercises

1. **Exercise 1**: Deploy the base application
2. **Exercise 2**: Add new API endpoints
3. **Exercise 3**: Implement real-time updates
4. **Exercise 4**: Configure auto-scaling
5. **Exercise 5**: Add monitoring and logging

## 📚 Additional Resources

- [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)
- [DAPR Documentation](https://docs.dapr.io/)
- [Workshop Detailed Guide](./docs/workshop-guide.md)

## 🤝 Contributing

This workshop is designed for educational purposes. Feel free to fork and customize for your own training sessions.

---

**Workshop Version**: 1.0.0  
**Last Updated**: August 2025  
**Target Duration**: 2-3 hours
