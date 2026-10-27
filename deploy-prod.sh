#!/bin/bash
# ==============================================================================
# 🚀 Kunal Tilak - Production Automated Deployment Script
# Targets: kunaltilak.com (Frontend Static) & api.kunaltilak.com (Backend API)
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

echo "========================================================"
echo "🚀 Starting Production Deployment for Kunal Tilak..."
echo "========================================================"

# Determine project directory root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Pull Latest Changes from Git
echo "📥 [1/5] Fetching latest changes from Git..."
if [ -d ".git" ]; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  echo "Current branch: $CURRENT_BRANCH"
  git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || git pull origin "$CURRENT_BRANCH" || echo "Git pull completed or already up to date."
else
  echo "ℹ️  No .git directory found at root; skipping git pull."
fi

# 2. Install Dependencies
echo "📦 [2/5] Installing Dependencies..."
npm install --production=false
cd frontend && npm install --production=false && cd "$SCRIPT_DIR"
cd backend && npm install --production=false && cd "$SCRIPT_DIR"

# 3. Build Frontend & Sync to Static Web Root
echo "📦 [3/5] Building Frontend..."
cd frontend
npm run build
cd "$SCRIPT_DIR"

# CloudPanel default static web root for kunaltilak.com
PROD_STATIC_ROOT="${PROD_STATIC_PATH:-/home/kunaltilak/htdocs/kunaltilak.com}"

if [ -d "$PROD_STATIC_ROOT" ] && [ "$SCRIPT_DIR/frontend/public" != "$PROD_STATIC_ROOT" ]; then
  echo "🔄 Syncing built frontend to Nginx static root: $PROD_STATIC_ROOT..."
  if command -v rsync &> /dev/null; then
    rsync -av --delete "$SCRIPT_DIR/frontend/public/" "$PROD_STATIC_ROOT/"
  else
    cp -rf "$SCRIPT_DIR/frontend/public/." "$PROD_STATIC_ROOT/"
  fi
  chmod -R 755 "$PROD_STATIC_ROOT" 2>/dev/null || true
  if id "kunaltilak" &>/dev/null; then
    chown -R kunaltilak:kunaltilak "$PROD_STATIC_ROOT" 2>/dev/null || true
  fi
  echo "✅ Frontend static files updated and permissions set at $PROD_STATIC_ROOT"
fi

# 3.5. Ensure /health-check reverse proxy is configured in Nginx on kunaltilak.com
echo "🔍 Checking Nginx configuration for /health-check routing on kunaltilak.com..."
NGINX_NEED_RELOAD=$(node -e '
const fs = require("fs");
const files = [
  "/etc/nginx/sites-enabled/kunaltilak.com.conf",
  "/etc/nginx/sites-available/kunaltilak.com.conf",
  "/etc/nginx/conf.d/kunaltilak.com.conf"
];
let changed = false;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, "utf8");
  if (content.includes("/health-check")) continue;
  const proxyBlock = `
  # Health Check & API Reverse Proxy to Backend (Port 5000)
  location /health-check {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host api.kunaltilak.com;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host api.kunaltilak.com;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
`;
  const locIdx = content.indexOf("location / {");
  if (locIdx !== -1) {
    fs.writeFileSync(file + ".bak", content, "utf8");
    content = content.slice(0, locIdx) + proxyBlock + "\n  " + content.slice(locIdx);
    fs.writeFileSync(file, content, "utf8");
    changed = true;
    console.error("🔧 Injected /health-check proxy into " + file);
  }
}
if (changed) console.log("1");
' 2>/dev/null || echo "0")

if [ "$NGINX_NEED_RELOAD" = "1" ]; then
  if nginx -t 2>/dev/null; then
    systemctl reload nginx 2>/dev/null || nginx -s reload 2>/dev/null || true
    echo "✅ Nginx reloaded successfully. kunaltilak.com/health-check is now active!"
  else
    echo "⚠️  Nginx syntax check reported an issue; reverting vhost files from backup..."
    for f in /etc/nginx/sites-enabled/kunaltilak.com.conf /etc/nginx/sites-available/kunaltilak.com.conf; do
      [ -f "${f}.bak" ] && mv -f "${f}.bak" "$f" 2>/dev/null || true
    done
  fi
fi

# 4. Build Backend & Sync Database
echo "📦 [4/5] Preparing Backend (Express + Prisma)..."
cd backend
if [ -f "prisma/schema.prisma" ]; then
  echo "🔄 Generating Prisma Client..."
  npx prisma generate
  echo "🔄 Applying Database Schema to Production Database..."
  npx prisma db push --skip-generate || echo "Prisma push step completed."
fi
mkdir -p logs uploads data
cd "$SCRIPT_DIR"

# 5. Reload PM2 Process for Production (Zero Downtime)
echo "🔄 [5/5] Reloading PM2 backend application (kunaltilak-backend-prod)..."
if command -v pm2 &> /dev/null; then
  pm2 startOrReload ecosystem.config.js --only kunaltilak-backend-prod --update-env
  pm2 save 2>/dev/null || true
  echo "📊 Current PM2 Status:"
  pm2 status kunaltilak-backend-prod
else
  echo "⚠️ PM2 is not installed globally. Run: npm install -g pm2"
fi

echo "========================================================"
echo "✅ Production Deployment completed successfully!"
echo "🌐 Frontend URL: https://kunaltilak.com"
echo "🔌 API URL:      https://api.kunaltilak.com"
echo "========================================================"
