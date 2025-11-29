# Deploy Frontend to Digital Ocean Spaces

Guide to deploy React frontend to Digital Ocean Spaces with CDN.

## Your Spaces URL
- **Space Name**: trip-planner-fe
- **Region**: BLR1 (Bangalore)
- **Endpoint**: https://trip-planner-fe.blr1.digitaloceanspaces.com
- **CDN**: https://trip-planner-fe.blr1.cdn.digitaloceanspaces.com

## Step 1: Update API URL

### Option A: Environment Variable (Recommended)

Create `.env.production` in the frontend root:

```bash
# trip-planner-fe/.env.production
REACT_APP_API_URL=https://api.yourdomain.com
# Or if using IP:
# REACT_APP_API_URL=http://your-droplet-ip
```

### Option B: Update api.js directly

Edit `src/services/api.js`:

```javascript
import axios from 'axios';

// Get API URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// ... rest of your api.js code
```

## Step 2: Configure AWS CLI for Spaces

Install AWS CLI:
```bash
# macOS
brew install awscli

# Ubuntu/Debian
sudo apt install awscli

# Windows
# Download from https://aws.amazon.com/cli/
```

Configure for Digital Ocean Spaces:
```bash
aws configure --profile digitalocean

# Enter:
# AWS Access Key ID: Your DO Spaces access key
# AWS Secret Access Key: Your DO Spaces secret key
# Default region name: blr1
# Default output format: json
```

Create `~/.aws/config` if needed:
```ini
[profile digitalocean]
region = blr1
output = json
```

## Step 3: Build React App

```bash
cd trip-planner-fe

# Install dependencies
npm install

# Build for production
npm run build

# This creates a 'build' folder with optimized files
```

## Step 4: Upload to Spaces

### Using AWS CLI (Recommended)

```bash
# Sync entire build folder
aws s3 sync build/ s3://trip-planner-fe/ \
  --endpoint-url=https://blr1.digitaloceanspaces.com \
  --acl public-read \
  --profile digitalocean

# With cache control for better performance
aws s3 sync build/ s3://trip-planner-fe/ \
  --endpoint-url=https://blr1.digitaloceanspaces.com \
  --acl public-read \
  --profile digitalocean \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "service-worker.js"

# Upload index.html and service-worker.js separately (no cache)
aws s3 cp build/index.html s3://trip-planner-fe/index.html \
  --endpoint-url=https://blr1.digitaloceanspaces.com \
  --acl public-read \
  --profile digitalocean \
  --cache-control "no-cache"

aws s3 cp build/service-worker.js s3://trip-planner-fe/service-worker.js \
  --endpoint-url=https://blr1.digitaloceanspaces.com \
  --acl public-read \
  --profile digitalocean \
  --cache-control "no-cache" \
  2>/dev/null || true  # Ignore if file doesn't exist
```

### Using s3cmd (Alternative)

```bash
# Install s3cmd
pip install s3cmd

# Configure
s3cmd --configure

# Upload
s3cmd sync --acl-public build/ s3://trip-planner-fe/
```

## Step 5: Configure Space Settings

In Digital Ocean Dashboard:

1. **Go to Spaces** → trip-planner-fe
2. **Click Settings**
3. **Enable Static Website Hosting**
   - Index Document: `index.html`
   - Error Document: `index.html` (for React Router)
4. **Enable CDN**
   - Creates: https://trip-planner-fe.blr1.cdn.digitaloceanspaces.com
   - Enable HTTPS
5. **CORS Settings** (if needed)
   ```json
   {
     "CORSRules": [
       {
         "AllowedOrigins": ["*"],
         "AllowedMethods": ["GET", "HEAD"],
         "AllowedHeaders": ["*"],
         "MaxAgeSeconds": 3000
       }
     ]
   }
   ```

## Step 6: Create Deployment Script

Create `deploy-to-spaces.sh`:

```bash
#!/bin/bash
set -e

echo "🏗️  Building React app..."
npm run build

echo "📤 Uploading to Digital Ocean Spaces..."

# Upload static assets with long cache
aws s3 sync build/ s3://trip-planner-fe/ \
  --endpoint-url=https://blr1.digitaloceanspaces.com \
  --acl public-read \
  --profile digitalocean \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "service-worker.js" \
  --delete

# Upload index.html without cache
aws s3 cp build/index.html s3://trip-planner-fe/index.html \
  --endpoint-url=https://blr1.digitaloceanspaces.com \
  --acl public-read \
  --profile digitalocean \
  --cache-control "no-cache, no-store, must-revalidate"

# Upload service-worker.js if exists
if [ -f "build/service-worker.js" ]; then
  aws s3 cp build/service-worker.js s3://trip-planner-fe/service-worker.js \
    --endpoint-url=https://blr1.digitaloceanspaces.com \
    --acl public-read \
    --profile digitalocean \
    --cache-control "no-cache, no-store, must-revalidate"
fi

echo "✅ Deployment complete!"
echo "🌐 Your app is live at:"
echo "   https://trip-planner-fe.blr1.digitaloceanspaces.com"
echo "   https://trip-planner-fe.blr1.cdn.digitaloceanspaces.com (CDN)"
```

Make it executable:
```bash
chmod +x deploy-to-spaces.sh
```

## Step 7: Deploy!

```bash
./deploy-to-spaces.sh
```

## Step 8: Test

Visit your URLs:
- Direct: https://trip-planner-fe.blr1.digitaloceanspaces.com
- CDN: https://trip-planner-fe.blr1.cdn.digitaloceanspaces.com

Test API connection:
1. Open browser console
2. Try logging in
3. Check Network tab for API calls
4. Verify no CORS errors

## Custom Domain (Optional)

### Setup Custom Domain

1. **Add CNAME record** in your DNS:
   ```
   Type: CNAME
   Name: app (or www)
   Value: trip-planner-fe.blr1.cdn.digitaloceanspaces.com
   TTL: 3600
   ```

2. **In DO Spaces Dashboard**:
   - Settings → CDN
   - Add Custom Domain: app.yourdomain.com
   - Enable SSL (automatic)

3. **Update frontend .env.production**:
   ```bash
   REACT_APP_API_URL=https://api.yourdomain.com
   ```

4. **Update backend ALLOWED_ORIGINS**:
   ```bash
   ALLOWED_ORIGINS=https://app.yourdomain.com
   ```

5. **Rebuild and deploy both**:
   ```bash
   # Frontend
   npm run build
   ./deploy-to-spaces.sh

   # Backend
   ssh root@droplet-ip
   cd /opt/trip-planner
   nano .env  # Update ALLOWED_ORIGINS
   ./deploy.sh
   ```

## GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy-spaces.yml`:

```yaml
name: Deploy to Digital Ocean Spaces

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'public/**'
      - 'package.json'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.API_URL }}

      - name: Deploy to Spaces
        uses: BetaHuhn/do-spaces-action@v2
        with:
          access_key: ${{ secrets.DO_SPACES_ACCESS_KEY }}
          secret_key: ${{ secrets.DO_SPACES_SECRET_KEY }}
          space_name: trip-planner-fe
          space_region: blr1
          source: build
          out_dir: /
```

Add secrets in GitHub:
- Settings → Secrets → Actions
- Add: `DO_SPACES_ACCESS_KEY`, `DO_SPACES_SECRET_KEY`, `API_URL`

## Caching Strategy

For optimal performance:

### Static Assets (JS, CSS, images)
```
Cache-Control: public, max-age=31536000
```
These have hash in filename, safe to cache forever.

### HTML Files
```
Cache-Control: no-cache, no-store, must-revalidate
```
Always fetch latest version.

### Service Worker
```
Cache-Control: no-cache
```
Ensure users get updates.

## Troubleshooting

### CORS Errors
1. Check backend ALLOWED_ORIGINS includes your Spaces URL
2. Verify `withCredentials: true` in axios config
3. Check Caddy headers in Caddyfile
4. Clear browser cache

### 404 on Routes
- Ensure Error Document is set to `index.html` in Spaces settings
- This allows React Router to handle routing

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Old Version Showing
1. Clear CDN cache in DO dashboard
2. Hard refresh browser (Cmd+Shift+R / Ctrl+F5)
3. Check if index.html has `no-cache` header

## Monitoring

### Setup monitoring for:
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics, Plausible)
- [ ] Performance (Lighthouse CI)

## Costs

- Spaces Storage: $5/month for 250GB
- CDN Bandwidth: $0.01/GB after 1TB free
- **Typical cost**: ~$5-7/month

## Next Steps

- [ ] Setup custom domain
- [ ] Configure CDN cache rules
- [ ] Add performance monitoring
- [ ] Setup automated deployments
- [ ] Add error tracking
