# GitHub Workflows Documentation

This directory contains GitHub Actions workflows for CI/CD automation.

## 📁 Workflows

### Production Workflows
- **`production-deploy.yml`** - Full production deployment (backend + mobile + frontend)
- **`backend-deploy.yml`** - Backend-only deployment to Render
- **`frontend-deploy.yml`** - Frontend-only deployment to Vercel

### CI Workflows
- **`backend-ci.yml`** - Backend CI tests with PostgreSQL
- **`admin-panel-ci.yml`** - Admin panel CI tests
- **`pr-validation.yml`** - Pull request validation checks
- **`pr-preview-complete.yml`** - PR preview deployment status

## 🚀 Deployment Setup

**Before running workflows, configure all required secrets and environment variables.**

See: **[DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md)** for:
- Complete list of required GitHub secrets
- Render environment variables
- Gmail SMTP setup for OTP
- Quick setup checklist
- Troubleshooting guide

## 📚 Additional Documentation

- **[../DEPLOYMENT.md](../DEPLOYMENT.md)** - Complete deployment guide
- **[../SECRETS_GUIDE.md](../SECRETS_GUIDE.md)** - Quick secrets reference
- **[../backend/EMAIL_OTP_SETUP.md](../backend/EMAIL_OTP_SETUP.md)** - Email OTP setup

## ⚙️ How It Works

### On Push to `main`:
1. **Backend**: Builds and deploys to Render
2. **Mobile**: Builds APK and creates GitHub release
3. **Frontend**: Deploys landing page + admin panel to Vercel

### Required Secrets (8):
- RENDER_DEPLOY_HOOK_URL
- EXPO_TOKEN
- VITE_API_BASE_URL
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
- MAIL_USERNAME (for CI tests)
- MAIL_PASSWORD (for CI tests)

### Required Render Variables (8):
- SPRING_DATASOURCE_URL
- SPRING_DATASOURCE_USERNAME
- SPRING_DATASOURCE_PASSWORD
- JWT_SECRET
- MAIL_HOST
- MAIL_PORT
- MAIL_USERNAME
- MAIL_PASSWORD

**See [DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md) for detailed instructions.**
