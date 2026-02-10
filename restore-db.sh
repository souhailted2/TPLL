#!/bin/bash
set -e
echo "Waiting for database..."
sleep 5
echo "Restoring database from backup..."
PGPASSWORD=${DB_PASSWORD:-changeme_strong_password} psql -h db -U tpl_user -d tpl_factory < /app/db_backup.sql
echo "Database restored successfully!"
