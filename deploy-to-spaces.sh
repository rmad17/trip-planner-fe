#!/bin/bash
# Deploy React app to Digital Ocean Spaces
set -e

# Configuration
SPACE_NAME="trip-planner-fe"
SPACE_REGION="blr1"
ENDPOINT_URL="https://${SPACE_REGION}.digitaloceanspaces.com"
AWS_PROFILE="digitalocean"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🏗️  Building React app...${NC}"
npm run build

echo -e "${YELLOW}📤 Uploading to Digital Ocean Spaces...${NC}"

# Upload all files except index.html and service-worker.js with long cache
echo "Uploading static assets with cache..."
aws s3 sync build/ s3://${SPACE_NAME}/ \
  --endpoint-url=${ENDPOINT_URL} \
  --acl public-read \
  --profile ${AWS_PROFILE} \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "service-worker.js" \
  --exclude "*.map" \
  --delete

# Upload index.html without cache
echo "Uploading index.html..."
aws s3 cp build/index.html s3://${SPACE_NAME}/index.html \
  --endpoint-url=${ENDPOINT_URL} \
  --acl public-read \
  --profile ${AWS_PROFILE} \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

# Upload service-worker.js if it exists
if [ -f "build/service-worker.js" ]; then
  echo "Uploading service worker..."
  aws s3 cp build/service-worker.js s3://${SPACE_NAME}/service-worker.js \
    --endpoint-url=${ENDPOINT_URL} \
    --acl public-read \
    --profile ${AWS_PROFILE} \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "application/javascript"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${GREEN}🌐 Your app is live at:${NC}"
echo -e "   Direct: https://${SPACE_NAME}.${SPACE_REGION}.digitaloceanspaces.com"
echo -e "   CDN:    https://${SPACE_NAME}.${SPACE_REGION}.cdn.digitaloceanspaces.com"
echo ""
echo -e "${YELLOW}💡 Tip: Use the CDN URL for better performance!${NC}"
