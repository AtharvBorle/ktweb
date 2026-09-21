# 🚀 Kunal Tilak Multi-Environment Deployment Guide

Comprehensive guide for deploying and maintaining the **Kunal Tilak Official Website & Enterprise API/CMS** on CloudPanel / Linux VPS using PM2, Nginx, and automated bash scripts.

---

## 🏗️ 1. Architecture Overview

| Domain | Environment | Type | Target / Port | CloudPanel Site Root |
| :--- | :--- | :--- | :--- | :--- |
| **`kunaltilak.com`** | Production | Static (Nginx) | Static Files (`frontend/public`) | `/home/kunaltilak/htdocs/kunaltilak.com` |
| **`api.kunaltilak.com`** | Production | Node.js (PM2) | `http://127.0.0.1:5000` | `/home/kunaltilak-api/htdocs/api.kunaltilak.com` |
| **`dev.kunaltilak.com`** | Development | Static (Nginx) | Static Files (`frontend/public`) | `/home/kunaltilak-dev/htdocs/dev.kunaltilak.com` |
| **`dev.api.kunaltilak.com`** | Development | Node.js (PM2) | `http://127.0.0.1:5001` | `/home/kunaltilak-dev-api/htdocs/dev.api.kunaltilak.com` |

---

## ⚙️ 2. PM2 Process Configuration (`ecosystem.config.js`)

PM2 manages two distinct isolated instances:
- **`kunaltilak-backend-prod`**: Port `5000`, `NODE_ENV=production`, max memory restart `500M`.
- **`kunaltilak-backend-dev`**: Port `5001`, `NODE_ENV=development`, max memory restart `300M`.

### PM2 Common Commands
```bash
# Start or reload all applications
pm2 startOrReload ecosystem.config.js --update-env

# Start or reload only production backend
pm2 startOrReload ecosystem.config.js --only kunaltilak-backend-prod --update-env

# Start or reload only development backend
pm2 startOrReload ecosystem.config.js --only kunaltilak-backend-dev --update-env

# Check status of running processes
pm2 status

# View live logs
pm2 logs kunaltilak-backend-prod
pm2 logs kunaltilak-backend-dev
```

---

## 🚀 3. Automated One-Command Deployments

### Development Deployment
Run the dedicated development script:
```bash
chmod +x deploy-dev.sh
./deploy-dev.sh
```
Or via npm:
```bash
npm run deploy:dev
```

**What it does automatically:**
1. Pulls latest changes from Git (`dev` branch).
2. Installs dependencies across root, backend, and frontend.
3. Builds the frontend static files and synchronizes them to `/home/kunaltilak-dev/htdocs/dev.kunaltilak.com`.
4. Runs `npx prisma generate` and `npx prisma db push` for the dev database schema.
5. Reloads the PM2 development instance `kunaltilak-backend-dev` with `--update-env`.

---

### Production Deployment
Run the dedicated production script:
```bash
chmod +x deploy-prod.sh
./deploy-prod.sh
```
Or via npm:
```bash
npm run deploy:prod
```

**What it does automatically:**
1. Pulls latest changes from Git (`main` branch).
2. Installs production dependencies.
3. Builds the frontend static files and synchronizes them to `/home/kunaltilak/htdocs/kunaltilak.com`.
4. Runs `npx prisma generate` and applies database schema updates.
5. Performs a zero-downtime reload on `kunaltilak-backend-prod` with `--update-env`.

---

## 🗄️ 4. Local PostgreSQL Database Creation via SSH (CLI & Prisma)

To create the PostgreSQL databases and users directly via SSH terminal:

### Option A: Using the Automated Setup Script (Fastest)
Run the included helper script as `root`:
```bash
chmod +x create-postgres-db.sh
./create-postgres-db.sh "kunaltilak_user" "YourStrongPassword123!"
```
*This automatically installs/starts PostgreSQL (if missing), creates user `kunaltilak_user`, creates both `kunaltilak_dev_db` and `kunaltilak_db`, and configures all privileges.*

---

### Option B: Manual SSH Terminal Commands (`psql`)
Run these commands in your SSH terminal:
```bash
# 1. Create PostgreSQL user
sudo -u postgres psql -c "CREATE USER kunaltilak_user WITH ENCRYPTED PASSWORD 'YourStrongPassword123!' CREATEDB;"

# 2. Create Development & Production databases
sudo -u postgres psql -c "CREATE DATABASE kunaltilak_dev_db OWNER kunaltilak_user;"
sudo -u postgres psql -c "CREATE DATABASE kunaltilak_db OWNER kunaltilak_user;"

# 3. Grant full permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kunaltilak_dev_db TO kunaltilak_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kunaltilak_db TO kunaltilak_user;"
sudo -u postgres psql -d kunaltilak_dev_db -c "GRANT ALL ON SCHEMA public TO kunaltilak_user;"
sudo -u postgres psql -d kunaltilak_db -c "GRANT ALL ON SCHEMA public TO kunaltilak_user;"
```

---

### 5. Let Prisma Create Tables & Seed Data
Once the database is created, Prisma automatically creates the tables, applies the schema, and seeds all candidate data:
```bash
# In backend directory:
npx prisma db push
npm run prisma:seed
```
*(Or simply run `./deploy-dev.sh` and `./deploy-prod.sh`, which run this step automatically).*

---

## 🔒 5. Environment Variables (`.env`)

In `backend/.env`:
```env
# Application Port
PORT=5000

# Security Secrets
SESSION_SECRET=kunal_tilak_production_secret_key_2026
JWT_SECRET=kunal_tilak_jwt_production_secret_key

# Local PostgreSQL Database Connection String on 127.0.0.1
DATABASE_URL="postgresql://kunaltilak_user:StrongPassword2026!@127.0.0.1:5432/kunaltilak_db"
DB_PROVIDER="postgresql"

# Optional CORS Whitelist additions (comma-separated)
ALLOWED_ORIGINS="https://kunaltilak.com,https://dev.kunaltilak.com,https://office.kunaltilak.com,https://dev.office.kunaltilak.com"
```

For the dev environment (e.g. `PORT=5001`), set `DATABASE_URL` to `kunaltilak_dev_db`.

---

## 🌐 6. CloudPanel Site Setup Checklists

### A. For Node.js Backend Sites (`api.kunaltilak.com` & `dev.api.kunaltilak.com`):
1. In CloudPanel, open **api.kunaltilak.com** -> **Vhost**.
2. Set the Application Port to `5000` (or `5001` for `dev.api.kunaltilak.com`).
3. Ensure the reverse proxy configuration from `nginx/api.kunaltilak.com.conf` is saved.
4. Issue SSL Certificate via CloudPanel Let's Encrypt.

### B. For Static Frontend Sites (`kunaltilak.com` & `dev.kunaltilak.com`):
1. In CloudPanel, open **kunaltilak.com** -> **Vhost**.
2. Ensure the static Nginx configuration from `nginx/kunaltilak.com.conf` is applied (includes `try_files` for clean URLs and subpages).
3. Issue SSL Certificate via CloudPanel Let's Encrypt.

---

## 🔍 6. How Dynamic API Routing Works

The frontend JavaScript (`api.service.js` & `admin.service.js`) contains intelligent origin detection:
- When visitors load `dev.kunaltilak.com`, all API requests and media lookups automatically target `https://dev.api.kunaltilak.com`.
- When visitors load `kunaltilak.com`, all API requests and media lookups automatically target `https://api.kunaltilak.com`.
- When working on local test servers (`localhost:3000` or `localhost:5500`), requests route to `http://localhost:5000/api`.
- CORS policies in Express seamlessly allow all `*.kunaltilak.com` subdomains with cookie credentials.
