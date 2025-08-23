# Copilot Instructions for Azure Container Apps Workshop

## Project Overview
This is a production-ready workshop project demonstrating Azure Container Apps with a React frontend and Node.js DAPR-enabled backend. The workshop is designed for hands-on learning with automatic deployment capabilities and multi-organization customization support.

## Architecture
- **Frontend**: React 18 with Tailwind CSS, network activity visualization, glass morphism UI
- **Backend**: Node.js with DAPR integration, sub-100ms response times, smart environment detection
- **Infrastructure**: Azure Container Apps with Bicep templates, Log Analytics, Container Registry
- **CI/CD**: GitHub Actions with automatic deployment on dev branch
- **Documentation**: Modular lab structure with customization guides

## Development Guidelines

### Code Standards
- Use modern JavaScript/React patterns with hooks and functional components
- Implement proper error handling and loading states for all API calls
- Follow container best practices in Dockerfiles (multi-stage builds, non-root users)
- Use environment variables for all configuration with `.env.template` as reference
- Maintain TypeScript-ready code structure even in JavaScript files

### PowerShell Command Guidelines
- **Use backticks (`) for line continuations** in PowerShell - never use backslashes (\)
- **Always use proper PowerShell syntax** for multi-line commands
- **Use `powershell` syntax highlighting** instead of `bash` for Azure CLI commands
- **Avoid deprecated Azure CLI flags** like `--sdk-auth` (use modern equivalents)
- **Test commands in PowerShell** before including in documentation
- **Example**: Use backticks for readability:
  ```powershell
  az ad sp create-for-rbac `
    --name "name" `
    --role contributor `
    --scopes /subscriptions/ID
  ```
- **Prefer single-line for simple commands** but use backticks when line becomes too long

### Azure Container Apps Specific
- Always enable DAPR for backend services with proper component configuration
- Use proper health check endpoints (`/health` for backend, nginx health for frontend)
- Configure appropriate resource limits (0.25 CPU, 0.5Gi memory for workshop demos)
- Implement ingress with external access for frontend, internal for backend
- Use managed identity for secure service-to-service communication

### Workshop Development
- Keep examples simple but production-representative
- Include comprehensive error handling for demo reliability
- Add clear educational comments explaining Azure Container Apps concepts
- Ensure all code works in isolated environments without external dependencies
- Focus on real-world applicable scenarios (todo app with network visualization)

## File Structure and Responsibilities

### Core Application Files
- `frontend/src/App.js`: Main React component with network activity dashboard
- `backend/src/app.js`: Express server with DAPR integration and health endpoints
- `frontend/Dockerfile` & `backend/Dockerfile`: Production container configurations
- `docker-compose.yml`: Local development environment setup

### Infrastructure and Deployment
- `infrastructure/bicep/main.bicep`: Complete Azure resources with proper outputs
- `azure.yaml`: AZD configuration for automated deployment
- `.github/workflows/deploy-dev.yml`: Auto-deployment on dev branch
- `scripts/deploy-infrastructure.ps1`: Manual infrastructure deployment
- `scripts/build-and-deploy.ps1`: Manual application deployment

### Documentation Structure
- `README.md`: Workshop overview and quick start instructions
- `docs/lab_part1.md`: Infrastructure deployment focused lab
- `docs/lab_part2.md`: Application deployment focused lab
- `DEPLOYMENT.md`: Comprehensive deployment options guide
- `CUSTOMIZATION_GUIDE.md`: Multi-organization customization instructions

## Key Features to Maintain

### Network Visualization
The frontend includes a real-time network activity dashboard that:
- Tracks API calls to the backend with timestamps and response times
- Displays container communication status with visual indicators
- Shows DAPR service invocation patterns
- Provides educational value for understanding container communication

### Automatic Deployment
The GitHub Actions workflow (`deploy-dev.yml`):
- Triggers automatically on pushes to dev branch
- Uses conditional infrastructure deployment (checks if resources exist)
- Supports manual workflow dispatch with parameters
- Includes proper error handling and rollback capabilities

### Multi-Organization Support
The project supports easy customization through:
- Repository variables for organization-specific settings
- Parameterized Bicep templates with sensible defaults
- Environment-specific configuration files
- Clear customization documentation

## Common Tasks and Patterns

### Adding New Backend Endpoints
1. Add route in `backend/src/app.js` with proper error handling
2. Update health check if needed for dependencies
3. Test with DAPR sidecar locally using `docker-compose up`
4. Ensure frontend can consume the new endpoint

### Infrastructure Updates
1. Modify `infrastructure/bicep/main.bicep` with new resources
2. Update parameters in `main.parameters.json` and `main.parameters.dev.json`
3. Test deployment with `scripts/deploy-infrastructure.ps1`
4. Update documentation if new configuration is required

### Frontend Enhancements
1. Follow existing React patterns with functional components
2. Update network activity tracking if adding API calls
3. Maintain responsive design with Tailwind CSS
4. Test container build with `docker build -f frontend/Dockerfile .`

## Troubleshooting Common Issues
- Container startup failures: Check health endpoints and DAPR component configuration
- Network communication issues: Verify ingress settings and service discovery
- Deployment failures: Check Azure quotas and resource naming conflicts
- Local development issues: Ensure Docker and DAPR CLI are properly installed
- **Service Principal Policy Errors**: "CredentialInvalidLifetimeAsPerAppPolicy" indicates restrictive organizational policies on credential lifetime
  - Solution 1: Add `--years 1` parameter to service principal creation commands
  - Solution 2: Try without `--years` parameter for minimal duration if organization policy is very restrictive
  - Solution 3: Contact Azure administrator to create SP or adjust policy
  - Solution 4: Use personal Azure subscription without restrictions
  - Solution 5: Implement GitHub OIDC for enterprise scenarios
- **PowerShell Command Failures**: Ensure commands use proper PowerShell syntax with backticks (`) for line continuations, never backslashes (\)

## Security Considerations
- Use managed identities for all Azure service authentication
- Never commit secrets or connection strings to the repository
- Follow least privilege principles in Bicep resource definitions
- Use Azure Container Registry for secure image storage
- Implement proper CORS policies for frontend-backend communication

## Performance Guidelines
- Backend should maintain sub-100ms response times for demo reliability
- Frontend should handle network failures gracefully with retry logic
- Container images should be optimized for size and startup time
- Use health checks and readiness probes appropriately

## Troubleshooting Common Issues
- Container startup failures: Check health endpoints and DAPR component configuration
- Network communication issues: Verify ingress settings and service discovery
- Deployment failures: Check Azure quotas and resource naming conflicts
- Local development issues: Ensure Docker and DAPR CLI are properly installed

## Workshop Delivery Notes
- The workshop is designed for 2-3 hour sessions with hands-on labs
- Participants should have basic Docker and Azure knowledge
- Labs are structured to build understanding progressively
- Include time for troubleshooting and Q&A in each lab section

## Future Enhancement Opportunities
- Add monitoring and alerting examples with Application Insights
- Implement blue-green deployment patterns
- Add security scanning and compliance checks
- Extend to multi-region deployment scenarios
- Include cost optimization examples and best practices

---

**Last Updated**: August 2025
**Project Status**: Production-ready workshop with automatic deployment
**Deployment**: Active on dev branch with GitHub Actions automation
