# GitHub Workflows Documentation

## 📋 PR Checks (On Pull Request to main)

### Workflow: `pr-checks.yml`

**4 Separate Checks Run on Every PR:**

1. ✅ **Backend Build Validation**
   - Builds Spring Boot backend with Maven
   - Validates no compilation errors
   - Does NOT run tests (faster feedback)
   - Does NOT deploy

2. ✅ **Frontend Build Validation**
   - Builds React/Vite frontend
   - Validates no build errors
   - Does NOT deploy

3. ✅ **Lint Check**
   - Runs ESLint on frontend code
   - Checks for code quality issues
   - Must pass before merge

4. ✅ **Mobile APK Build Validation**
   - Builds Android APK with Expo/EAS
   - Validates mobile app builds successfully
   - Does NOT deploy or create release

**All 4 checks must pass before PR can be merged.**

---

## 🚀 Production Deployment (On Merge to main)

### Three Workflows Run After Merge:

### 1. Backend Deploy (`backend-deploy.yml`)
**Triggers:** Push to main (backend code changes only)

**Steps:**
- Builds backend JAR with Maven
- Deploys to Render automatically
- Runs health check

**Result:** Backend live on Render

---

### 2. Frontend Deploy (`frontend-deploy.yml`)
**Triggers:** Push to main (frontend code changes only)

**Steps:**
- Builds React/Vite app
- Deploys to Vercel production
- Automatically updates live site

**Result:** Frontend live on Vercel

---

### 3. Production Deploy (`production-deploy.yml`)
**Triggers:** Push to main (any changes)

**Steps:**
- Deploys backend to Render
- Builds production APK
- Creates GitHub Release with APK
- Uploads APK as artifact (90 days retention)
- Updates 'latest' tag

**Result:** Complete deployment + APK available for download

---

## 📊 Summary

### PR Flow (4 Checks):
```
PR Opened → 4 Checks Run:
├── Backend Build Validation ✅
├── Frontend Build Validation ✅  
├── Lint Check ✅
└── Mobile APK Build Validation ✅

All Pass → Ready to Merge
```

### Merge to main Flow (3 Deployments):
```
Merge to main → 3 Deployments Run:
├── Backend → Render ✅
├── Frontend → Vercel ✅
└── Mobile APK → GitHub Release ✅

Result: Everything Live!
```

---

## 🔧 Secrets Required

### For PR Checks:
- `EXPO_TOKEN` - For building mobile APK

### For Production Deploys:
- `RENDER_API_KEY` - Render deployment API key
- `RENDER_SERVICE_ID` - Render service ID  
- `RENDER_DEPLOY_HOOK_URL` - Render deploy webhook
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `VITE_API_BASE_URL` - API URL for frontend/mobile
- `GITHUB_TOKEN` - Auto-provided by GitHub Actions

---

## 📁 Disabled Workflows

Moved to `_disabled/` folder (no longer running):
- `pr-validation.yml` - Replaced by `pr-checks.yml`
- `pr-preview-complete.yml` - Preview deployments removed
- `backend-ci.yml` - Duplicate backend checks
- `admin-panel-ci.yml` - Merged into main workflow

**Why disabled?** These caused 9 redundant checks on every PR.

---

## ✅ What's Working

### ✓ On PR:
- 4 clean, fast validation checks
- No unnecessary deployments
- Clear pass/fail status

### ✓ On Merge:
- Backend auto-deploys to Render
- Frontend auto-deploys to Vercel  
- Mobile APK published to GitHub Releases
- All working perfectly as before!

---

## 🔄 To Re-enable Disabled Workflows

If needed:
```bash
cd .github/workflows/_disabled
mv <workflow-name>.yml ../
git add ../
git commit -m "Re-enable <workflow-name>"
git push
```
