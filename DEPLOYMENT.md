# Deployment Guide

## H&N Re-Irradiation Calculator Deployment

### Quick Deploy to Vercel

**Option 1: Via Vercel CLI (recommended)**
```bash
# Install Vercel CLI (if needed)
npm install -g vercel

# Deploy
npx vercel

# Follow prompts to:
# - Link to Vercel account
# - Create new project or link existing
# - Confirm build settings (auto-detected from next.config.mjs)
```

**Option 2: Via GitHub + Vercel Dashboard**
1. Push code to GitHub repository
2. Go to vercel.com/new
3. Import the GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### Build Configuration

- **Framework:** Next.js 14 (App Router)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x or higher

### Environment Variables

None required - this is a standalone calculator with no backend dependencies.

### Post-Deployment

After deployment, verify:
- [ ] Calculator loads without errors
- [ ] All input fields work
- [ ] OAR selection displays all 13 organs
- [ ] Calculate button triggers results
- [ ] RPA classification displays correctly
- [ ] OAR constraint results show with proper colors
- [ ] Mobile responsive layout works
- [ ] Medical disclaimer is prominent

### Custom Domain (Optional)

To add a custom domain:
1. Go to Vercel dashboard → Project Settings → Domains
2. Add your domain (e.g., hn-rert.mda.edu)
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning (~10 minutes)

### Monitoring

Vercel provides automatic:
- Build logs
- Runtime logs  
- Analytics (page views, performance)
- Error tracking

Access via: vercel.com/dashboard

---

## Current Deployment Status

**Last Updated:** 2026-01-27 06:00 AM CST  
**Build Status:** ✅ Passing  
**Commit:** d9d8268  
**Deployment URL:** _Pending initial deployment_

