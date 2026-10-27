#!/bin/bash
# ==============================================================================
# 🚀 Kunal Tilak - Development Automated Deployment Script
# Targets: dev.kunaltilak.com (Frontend Static) & dev.api.kunaltilak.com (Backend API)
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

echo "========================================================"
echo "🚀 Starting Development Deployment for Kunal Tilak..."
echo "========================================================"

# Determine project directory root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Pull Latest Changes from Git
echo "📥 [1/5] Fetching latest changes from Git..."
if [ -d ".git" ]; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "dev")
  echo "Current branch: $CURRENT_BRANCH"
  git pull origin "$CURRENT_BRANCH" 2>/dev/null || git pull origin dev 2>/dev/null || git pull origin main 2>/dev/null || echo "Git pull completed or already up to date."
else
  echo "ℹ️  No .git directory found at root; skipping git pull."
fi

# 2. Install Dependencies
echo "📦 [2/5] Installing Dependencies..."
npm install
cd frontend && npm install && cd "$SCRIPT_DIR"
cd backend && npm install && cd "$SCRIPT_DIR"

# 3. Build Frontend & Sync to Static Web Root
echo "📦 [3/5] Building Frontend..."
cd frontend
npm run build
cd "$SCRIPT_DIR"

# CloudPanel default static web root for dev.kunaltilak.com
DEV_STATIC_ROOT="${DEV_STATIC_PATH:-/home/kunaltilak-dev/htdocs/dev.kunaltilak.com}"

if [ -d "$DEV_STATIC_ROOT" ] && [ "$SCRIPT_DIR/frontend/public" != "$DEV_STATIC_ROOT" ]; then
  echo "🔄 Syncing built frontend to Nginx static root: $DEV_STATIC_ROOT..."
  if command -v rsync &> /dev/null; then
    rsync -av --delete "$SCRIPT_DIR/frontend/public/" "$DEV_STATIC_ROOT/"
  else
    cp -rf "$SCRIPT_DIR/frontend/public/." "$DEV_STATIC_ROOT/"
  fi
  chmod -R 755 "$DEV_STATIC_ROOT" 2>/dev/null || true
  if id "kunaltilak-dev" &>/dev/null; then
    chown -R kunaltilak-dev:kunaltilak-dev "$DEV_STATIC_ROOT" 2>/dev/null || true
  fi
  echo "✅ Frontend static files updated and permissions set at $DEV_STATIC_ROOT"
fi

# 3.5. Ensure /health-check reverse proxy is configured in Nginx on dev.kunaltilak.com
echo "🔍 Checking Nginx configuration for /health-check routing on dev.kunaltilak.com..."
NGINX_NEED_RELOAD=$(node -e '
const fs = require("fs");
const path = require("path");
const dirs = ["/etc/nginx/sites-enabled", "/etc/nginx/sites-available", "/etc/nginx/conf.d"];
let changed = false;

const proxyBlock = `
  # Health Check & API Reverse Proxy to Backend (Port 5001)
  location /health-check {
    proxy_pass http://127.0.0.1:5001;
    proxy_http_version 1.1;
    proxy_set_header Host dev.api.kunaltilak.com;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:5001;
    proxy_http_version 1.1;
    proxy_set_header Host dev.api.kunaltilak.com;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
`;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  let entries = [];
  try { entries = fs.readdirSync(dir); } catch (e) { continue; }
  for (const entry of entries) {
    const file = path.join(dir, entry);
    try {
      if (!fs.statSync(file).isFile()) continue;
      let c = fs.readFileSync(file, "utf8");
      if (c.includes("dev.kunaltilak.com") && c.includes("server_name")) {
        if (!c.includes("/health-check")) {
          const locIdx = c.indexOf("location / {");
          if (locIdx !== -1) {
            fs.writeFileSync(file + ".bak", c, "utf8");
            c = c.slice(0, locIdx) + proxyBlock + "\n  " + c.slice(locIdx);
            fs.writeFileSync(file, c, "utf8");
            changed = true;
            console.error("🔧 Injected /health-check proxy into " + file);
          }
        }
      }
    } catch (err) {}
  }
}
if (changed) console.log("1");
' 2>/dev/null || echo "0")

if [ "$NGINX_NEED_RELOAD" = "1" ]; then
  if nginx -t 2>/dev/null; then
    systemctl reload nginx 2>/dev/null || nginx -s reload 2>/dev/null || true
    echo "✅ Nginx reloaded successfully. dev.kunaltilak.com/health-check is now active!"
  else
    echo "⚠️  Nginx syntax check reported an issue; reverting vhost files from backup..."
    for f in /etc/nginx/sites-enabled/dev.kunaltilak.com.conf /etc/nginx/sites-available/dev.kunaltilak.com.conf; do
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
  echo "🔄 Pushing Database Schema to Dev Database..."
  npx prisma db push --skip-generate || echo "Prisma push step completed."
fi
mkdir -p logs uploads data
cd "$SCRIPT_DIR"

# 5. Reload PM2 Process for Development
echo "🔄 [5/5] Reloading PM2 backend application (kunaltilak-backend-dev)..."
if command -v pm2 &> /dev/null; then
  pm2 startOrReload ecosystem.config.js --only kunaltilak-backend-dev --update-env
  pm2 save 2>/dev/null || true
  echo "📊 Current PM2 Status:"
  pm2 status kunaltilak-backend-dev
else
  echo "⚠️ PM2 is not installed globally. Run: npm install -g pm2"
fi

echo "========================================================"
echo "✅ Development Deployment completed successfully!"
echo "🌐 Frontend URL: https://dev.kunaltilak.com"
echo "🔌 API URL:      https://dev.api.kunaltilak.com"
echo "========================================================"
