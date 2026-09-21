#!/bin/bash
# ==============================================================================
# 🐘 Automated PostgreSQL Database & User Creation Script (SSH / Linux CLI)
# Run as root or a user with sudo privileges
# ==============================================================================

set -e

echo "========================================================"
echo "🐘 Creating PostgreSQL User and Databases for Kunal Tilak..."
echo "========================================================"

DB_USER="${1:-kunaltilak_user}"
DB_PASS="${2:-KunalTilakSecure2026!}"
DEV_DB="kunaltilak_dev_db"
PROD_DB="kunaltilak_db"

echo "👤 Database User:     $DB_USER"
echo "🗄️  Dev Database:      $DEV_DB"
echo "🗄️  Prod Database:     $PROD_DB"
echo "========================================================"

# 1. Ensure PostgreSQL is installed and running
if ! command -v psql &> /dev/null; then
  echo "⚠️ PostgreSQL not found. Installing PostgreSQL..."
  apt-get update && apt-get install -y postgresql postgresql-contrib || yum install -y postgresql-server postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
fi

# 2. Create User if not exists
echo "🔄 [1/4] Creating PostgreSQL user '$DB_USER'..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS' CREATEDB;"

sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';"

# 3. Create Dev Database
echo "🔄 [2/4] Creating '$DEV_DB'..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DEV_DB'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE $DEV_DB OWNER $DB_USER;"

# 4. Create Prod Database
echo "🔄 [3/4] Creating '$PROD_DB'..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$PROD_DB'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE $PROD_DB OWNER $DB_USER;"

# 5. Grant Privileges & Schema Permissions
echo "🔄 [4/4] Granting privileges on databases..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DEV_DB TO $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $PROD_DB TO $DB_USER;"

# PostgreSQL 15+ Public Schema Permissions
sudo -u postgres psql -d $DEV_DB -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -d $PROD_DB -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null || true

echo "========================================================"
echo "🎉 PostgreSQL Setup Completed Successfully!"
echo "========================================================"
echo "📌 Dev Connection String:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DEV_DB\""
echo ""
echo "📌 Prod Connection String:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$PROD_DB\""
echo "========================================================"
