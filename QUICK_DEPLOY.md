# 🚀 Quick Deploy Guide (2 Minutes)

## Option 1: GitHub + Vercel (Easiest - No CLI)

### Step 1: Create GitHub Repo
1. Go to https://github.com/new
2. Repository name: `hn-rert-calculator` (or anything)
3. Keep it Private (unless you want public)
4. **Don't** initialize with README (we already have files)
5. Click "Create repository"

### Step 2: Push Code
GitHub will show you commands. Run these in `/Users/ClawdBot/clawd/hn-rert-calculator`:

```bash
git remote add origin https://github.com/YOUR_USERNAME/hn-rert-calculator.git
git branch -M main
git push -u origin main
```

**If it asks for credentials:**
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your GitHub password)
  - Get token: https://github.com/settings/tokens/new
  - Scopes needed: `repo` (full control of private repositories)

### Step 3: Deploy on Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Find your `hn-rert-calculator` repo
4. Click "Import"
5. Leave all settings as default (auto-detected Next.js)
6. Click "Deploy"
7. Wait 30-60 seconds
8. **Done!** You'll get a live URL like `hn-rert-calculator-abc123.vercel.app`

---

## Option 2: Vercel CLI (If You Want CLI)

### Step 1: Authenticate
```bash
cd /Users/ClawdBot/clawd/hn-rert-calculator
npx vercel login
```

**What happens:**
- CLI shows a URL like: `https://vercel.com/oauth/device?user_code=XXXX-YYYY`
- Opens in browser automatically
- Log in to Vercel (or create account)
- Approve the device with the code shown
- CLI auto-detects and continues

### Step 2: Deploy
```bash
npx vercel --prod
```

**What it asks:**
1. "Set up and deploy?" → Yes
2. "Which scope?" → Your username (default)
3. "Link to existing project?" → No
4. "What's your project's name?" → `hn-rert-calculator` (or press Enter)
5. "In which directory is your code?" → `./` (press Enter)
6. "Want to override settings?" → No

**Result:** Live URL in ~60 seconds

---

## Troubleshooting

### "Permission denied" when pushing to GitHub
→ Need Personal Access Token: https://github.com/settings/tokens/new
→ Use token as password when Git asks

### "Vercel login times out"
→ Use GitHub method instead (Option 1)

### "Build failed on Vercel"
→ Shouldn't happen (builds locally). Check Vercel build logs.

### "Want to test locally first"
```bash
cd /Users/ClawdBot/clawd/hn-rert-calculator
npm run dev
# Visit http://localhost:3000
```

---

## What Happens After Deploy

You'll get a URL like:
- `hn-rert-calculator.vercel.app`
- Or custom: `hn-rert-calculator-YOUR_USERNAME.vercel.app`

**Automatic features:**
- HTTPS enabled
- Global CDN
- Automatic deploys on git push
- Preview URLs for branches
- Free SSL certificate

---

## Recommended: Option 1 (GitHub)

**Why GitHub method is better:**
- No CLI auth needed
- Version control in cloud
- Easy to share with team
- Vercel auto-deploys on push
- Can revert to any commit

**Time:** 5 minutes total

---

## Current Status

- ✅ Build ready (`npm run build` succeeds)
- ✅ All code committed (7 commits)
- ⏳ Just needs: Git push + Vercel import

---

**Ready when you are!** 🚀
