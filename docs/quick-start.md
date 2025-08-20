# Quick Start Guide

## 🚀 For Workshop Participants

### Prerequisites Check
Before starting, ensure you have:
- [ ] Azure CLI installed (`az --version`)
- [ ] Docker Desktop running (`docker ps`)
- [ ] Git configured (`git --version`)
- [ ] GitHub account for forking

### Step 1: Fork and Clone
1. Fork this repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/containerAppWorkshop
   cd containerAppWorkshop
   ```

### Step 2: Azure Login
```bash
az login
az account set --subscription "YOUR-SUBSCRIPTION-ID"
```

### Step 3: Deploy Infrastructure (Instructor-led)
```powershell
./infrastructure/scripts/setup-environment.ps1 -ResourceGroupName "workshop-rg-YOURNAME" -Location "eastus"
```

### Step 4: Deploy Application
```powershell
./scripts/build-and-deploy.ps1
```

### Step 5: Test Your Application
- Open the frontend URL provided in the output
- Try adding and completing todos
- Check the health endpoint: `YOUR-BACKEND-URL/health`

## 🎯 Workshop Exercises

### Exercise 1: Modify the API
Edit `backend/src/app.js` and add:
```javascript
app.get('/api/hello/:name', (req, res) => {
  res.json({ 
    message: `Hello ${req.params.name}!`,
    workshop: 'Azure Container Apps'
  });
});
```

Deploy: `./scripts/build-and-deploy.ps1`

### Exercise 2: Update Frontend
Edit `frontend/src/App.js` and personalize the title:
```javascript
<h1>🚀 [Your Name]'s Container Apps Demo</h1>
```

Deploy: `./scripts/build-and-deploy.ps1`

### Exercise 3: Test Live Updates
1. Make changes to the code
2. Run deployment script
3. Watch your changes appear live!

## 📞 Need Help?

- **Can't log in to Azure?** Ask the instructor for help
- **Docker not working?** Restart Docker Desktop
- **Build failing?** Check the error messages in PowerShell
- **App not loading?** Wait 2-3 minutes for deployment to complete

## 🧹 Cleanup (End of Workshop)
```bash
az group delete --name "workshop-rg-YOURNAME" --yes --no-wait
```

---
**⏱️ Estimated Time**: 30 minutes for initial setup, 15 minutes per exercise
