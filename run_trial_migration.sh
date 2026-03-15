#!/bin/bash

# Trial HWID Tracking Migration Runner
# This script runs the migration to create trial_hwid_tracking table

echo "🚀 Running trial HWID tracking migration..."

# Read the migration file
MIGRATION_SQL=$(cat supabase/migrations/005_trial_hwid_tracking.sql)

# Supabase credentials
SUPABASE_URL="https://czlahmuvhlcdxgmtarja.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bGFobXV2aGxjZHhnbXRhcmphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUzNjMyNywiZXhwIjoyMDc2MTEyMzI3fQ.wmSSa1z2VAwp9T8vCI87hR-Vx0SgjYgDkyHayBUZYhk"

# Execute via Supabase REST API
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}"

echo ""
echo "✅ Migration completed!"
echo ""
echo "To verify, check if trial_hwid_tracking table exists in Supabase Dashboard"
