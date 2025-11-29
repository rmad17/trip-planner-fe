# Deploy to DigitalOcean App Platform

## Overview
DigitalOcean App Platform is perfect for React apps - it's free for static sites and handles React Router properly!

## Prerequisites
- [ ] GitHub account
- [ ] Code pushed to a GitHub repository
- [ ] DigitalOcean account

## Option 1: Deploy via Web UI (Easiest)

### Step 1: Push Your Code to GitHub

If you haven't already:

```bash
# If you don't have a GitHub repo yet, create one at github.com
# Then add it as a remote:
git remote add origin https://github.com/YOUR_USERNAME/trip-planner-fe.git

# Push your code
git push -u origin main
```

### Step 2: Create App on DigitalOcean

1. Go to: https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Choose **GitHub** as the source
4. Authorize DigitalOcean to access your GitHub repos (first time only)
5. Select your repository: `trip-planner-fe`
6. Select branch: `main`
7. Check **"Autodeploy"** - deploys automatically on git push

### Step 3: Configure Build Settings

App Platform will auto-detect it's a React app. Verify these settings:

- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Environment**: Node.js

### Step 4: Configure Routes (Important for React Router!)

In the app settings, ensure:
- **Catchall Document**: `index.html`

This makes all routes serve index.html, enabling React Router to work properly!

### Step 5: Choose Plan

- Select **"Basic"** plan
- For static sites: **FREE** (0 USD/month)

### Step 6: Deploy!

1. Review your settings
2. Click **"Create Resources"**
3. Wait 3-5 minutes for the build and deployment

You'll get a URL like: `https://trip-planner-xxxxx.ondigitalocean.app`

## Option 2: Deploy via CLI (Advanced)

### Install doctl (DigitalOcean CLI)

```bash
# Install doctl
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-1.104.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init
# Enter your DigitalOcean API token when prompted
```

### Deploy Using app.yaml

```bash
# Create the app from the config file
doctl apps create --spec .do/app.yaml

# Or update existing app
doctl apps update YOUR_APP_ID --spec .do/app.yaml
```

## Environment Variables (If Needed)

If you need to add environment variables (like API keys):

### Via Web UI:
1. Go to your app in the DigitalOcean dashboard
2. Click **Settings** → **App-Level Environment Variables**
3. Add your variables (e.g., `REACT_APP_MAPBOX_TOKEN`)

### Via app.yaml:
```yaml
static_sites:
  - name: trip-planner-fe
    envs:
      - key: REACT_APP_MAPBOX_TOKEN
        value: ${MAPBOX_TOKEN}
        type: SECRET
```

## Custom Domain (Optional)

After deployment, you can add a custom domain:

1. Go to your app in the dashboard
2. Click **Settings** → **Domains**
3. Add your domain
4. Update your DNS records as instructed

## Monitoring & Logs

- **Runtime Logs**: See build and deployment logs in the dashboard
- **Activity**: View deployment history
- **Metrics**: Monitor bandwidth and requests

## Benefits vs Spaces

✅ Proper React Router support (catchall document)
✅ Free for static sites
✅ Automatic HTTPS
✅ Global CDN
✅ CI/CD built-in (auto-deploy on push)
✅ No XML "Access Denied" errors
✅ Custom domains supported
✅ Easy rollbacks

## Troubleshooting

### Build Fails
- Check that `package.json` has the correct build script
- Verify all dependencies are in `package.json` (not just `package-lock.json`)

### 404 on Routes
- Make sure **Catchall Document** is set to `index.html`

### Environment Variables Not Working
- React env vars must start with `REACT_APP_`
- Rebuild the app after adding env vars

## Cost
**FREE** for static sites! You only pay if you add:
- Databases
- Backend services
- More than 100GB bandwidth/month (very high)

## Next Steps After Deployment

1. Update your `.env` file if needed for production API endpoints
2. Set up a custom domain if desired
3. Remove the Spaces deployment if no longer needed
4. Update your README with the new deployment URL

## Your Deployment URL
After deployment, you'll get a URL like:
`https://trip-planner-xxxxx.ondigitalocean.app`

This will properly handle all React Router routes! 🎉
