# Copilot Instructions for Azure Container Apps Workshop

## Project Context
This is a hands-on workshop project for Azure Container Apps featuring a two-tier application with React frontend and Node.js DAPR-enabled backend.

## Code Guidelines
- Use TypeScript for new JavaScript/Node.js code where possible
- Follow React best practices for frontend components
- Implement proper error handling and logging
- Use environment variables for configuration
- Follow Docker best practices for container optimization

## Azure Container Apps Specific
- Always enable DAPR for backend services
- Use proper health check endpoints
- Configure appropriate resource limits
- Implement proper ingress configurations
- Use Azure Container Registry for image storage

## Workshop Development
- Keep examples simple but functional
- Include comprehensive error handling for demo reliability
- Add clear comments for educational purposes
- Ensure all code works in isolated environments
- Focus on real-world applicable scenarios

## Infrastructure as Code
- Use Bicep for Azure resource definitions
- Include proper resource naming conventions
- Implement least privilege security principles
- Include monitoring and logging resources
- Use parameters for environment-specific values

Progress Tracking:
- [x] Project structure created
- [x] Core documentation established
- [x] Frontend application scaffolded
- [x] Backend API with DAPR integration created
- [x] Infrastructure templates configured
- [x] CI/CD pipelines implemented
- [x] Workshop documentation completed
