# Mataam Restaurant Hub - Deployment Guide

## ✅ Deployment Status

The app has been successfully deployed to Vercel!

### Deployment Details

- **Project Name**: `mataam-restaurant-hub`
- **Team**: `shoebbirader4s-projects`
- **Framework**: TanStack Start with Vite
- **Node Version**: 24.x
- **Region**: IAD1 (US East - Virginia)
- **Status**: ✅ Live and Running

### Live URLs

- **Production**: https://mataam-restaurant-hub.vercel.app
- **Fallback**: https://mataam-restaurant-a8waus2ar-shoebbirader4s-projects.vercel.app
- **GitHub Link**: https://github.com/Shoebbirader4/Mataam
- **Vercel Dashboard**: https://vercel.com/shoebbirader4s-projects/mataam-restaurant-hub

---

## Environment Variables Setup

### Required Environment Variables

The app requires 4 environment variables to be set in Vercel:

```
LOVABLE_API_KEY
GOOGLE_SHEETS_API_KEY
AZAD_SPREADSHEET_ID
ROSHAN_SPREADSHEET_ID
```

### Setting Environment Variables via Vercel Dashboard

1. Go to: https://vercel.com/shoebbirader4s-projects/mataam-restaurant-hub
2. Click **Settings** → **Environment Variables**
3. Add each variable:

#### 1. LOVABLE_API_KEY

```
sk_fW1LhqWEk7taMdr8lNtdPBa0OvYJuUk/IWcmEkzYJUW/FxErWQMmp5OTtG86zXqCh6RC8At7z17Qx8SZ7eXoTxR71/f+yhw4kXZORJ59w8RTWRy7apVZiiIB4Uuba/vu7+AN5riUiyd3xYqupc/7MuLMA8ICbmT15fJjhko+/yHHUIjhMAOSOsX+kGPr9qqqQJKjarIi4kDckU7dJsk739WhyiLwVJbbvNrqPODx7rs4q/0N/cqMZo8sGEUWsdk2AAATuw==
```

- **Type**: Secret
- **Environments**: Production, Preview, Development

#### 2. GOOGLE_SHEETS_API_KEY

```
lovc_b383681975b6b140943b44d86839079c
```

- **Type**: Secret
- **Environments**: Production, Preview, Development

#### 3. AZAD_SPREADSHEET_ID

```
1F1JAYGpaeCP3ShA9vqbteHL2PX7zAtTwIdSw6-Xut9w
```

- **Type**: Config (or Secret)
- **Environments**: Production, Preview, Development

#### 4. ROSHAN_SPREADSHEET_ID

```
13FRAFg1WEEXBzy8KzMsI4s9TCxn2p16TXqH-vS-u4zU
```

- **Type**: Config (or Secret)
- **Environments**: Production, Preview, Development

### Setting via CLI (Alternative)

```bash
cd Mataam

# Add each variable
vercel env add LOVABLE_API_KEY production "sk_fW1LhqWEk7taMdr8lNtdPBa0OvYJuUk/IWcmEkzYJUW/FxErWQMmp5OTtG86zXqCh6RC8At7z17Qx8SZ7eXoTxR71/f+yhw4kXZORJ59w8RTWRy7apVZiiIB4Uuba/vu7+AN5riUiyd3xYqupc/7MuLMA8ICbmT15fJjhko+/yHHUIjhMAOSOsX+kGPr9qqqQJKjarIi4kDckU7dJsk739WhyiLwVJbbvNrqPODx7rs4q/0N/cqMZo8sGEUWsdk2AAATuw=="

vercel env add GOOGLE_SHEETS_API_KEY production "lovc_b383681975b6b140943b44d86839079c"

vercel env add AZAD_SPREADSHEET_ID production "1F1JAYGpaeCP3ShA9vqbteHL2PX7zAtTwIdSw6-Xut9w"

vercel env add ROSHAN_SPREADSHEET_ID production "13FRAFg1WEEXBzy8KzMsI4s9TCxn2p16TXqH-vS-u4zU"

# Redeploy with new environment variables
vercel redeploy --yes
```

---

## Build Information

### Build Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `.output`
- **Install Command**: `npm install` (auto-detected)

### Build Artifacts

- **Client**: 382 KB (118 KB gzipped)
- **Server**: 649 KB (136 KB gzipped)
- **Total**: ~1 MB gzipped

### Build Performance

- Client build: 3.13s
- SSR build: 1.10s
- Nitro/Server build: 1.64s
- **Total build time**: ~6s

---

## Git Integration

### Automatic Deployments

To enable automatic deployments when you push to GitHub:

```bash
vercel git connect
```

This will:

- Connect the GitHub repository
- Set up automatic deployments on push
- Deploy previews for pull requests

### Current Status

- **GitHub Repository**: https://github.com/Shoebbirader4/Mataam
- **Connection Status**: ⚠️ Not yet connected (requires manual setup)

### Connecting GitHub

1. Go to Vercel Dashboard: https://vercel.com/shoebbirader4s-projects/mataam-restaurant-hub
2. Click **Settings** → **Git**
3. Click **Connect Git Repository**
4. Authorize and select the Mataam repository

---

## Health Check

### Current Status

✅ **Deployment**: Active
✅ **Build**: Successful
✅ **Uptime**: Running
✅ **API**: Responding

### Recent Logs

```
13:12:06.30  GET /                200  Success
13:12:06.31  GET /favicon.ico     404  Not Found (expected)
```

### Check Live App

Visit: https://mataam-restaurant-hub.vercel.app

---

## Post-Deployment Tasks

### ✅ Completed

- [x] App deployed to Vercel
- [x] TanStack Start framework detected
- [x] Build configuration optimized
- [x] Production domain assigned
- [x] Domain aliases configured

### ⏳ Next Steps

- [ ] **Add Environment Variables** (Use Vercel Dashboard)
- [ ] Connect GitHub repository for auto-deployment
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring and alerting
- [ ] Test Google Sheets integration with live data
- [ ] Set up error tracking (Sentry)

---

## Verification Steps

### 1. Verify Deployment

```bash
vercel status
```

### 2. View Build Logs

```bash
vercel logs --follow
```

### 3. Test the Live App

```bash
curl https://mataam-restaurant-hub.vercel.app
```

### 4. Inspect Project

```bash
vercel projects inspect mataam-restaurant-hub
```

---

## Troubleshooting

### App not working after setting env vars?

**Solution**: Redeploy with new environment variables

```bash
vercel redeploy --prod --yes
```

### Build failing?

Check build logs:

```bash
vercel logs --follow
```

Or view in dashboard at:
https://vercel.com/shoebbirader4s-projects/mataam-restaurant-hub/deployments

### Need to rollback?

```bash
vercel rollback
```

---

## Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **TanStack Start**: https://tanstack.com/start/latest
- **Environment Variables**: https://vercel.com/docs/environment-variables
- **Custom Domains**: https://vercel.com/docs/custom-domains

---

## Support & Maintenance

### Redeployment

```bash
cd Mataam
vercel redeploy --prod --yes
```

### View Project Settings

```bash
vercel projects inspect mataam-restaurant-hub
```

### Update Environment Variables

```bash
vercel env ls  # List all env vars
```

---

**Deployment Date**: September 2, 2026
**Vercel CLI Version**: 59.11.2
**Node.js Version**: 24.x
