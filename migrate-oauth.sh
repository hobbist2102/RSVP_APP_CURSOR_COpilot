#!/bin/bash

# Script to run the OAuth migration with improved security features
echo "Starting OAuth database migration..."
npx tsx scripts/oauth-migration-improved.ts

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Migration completed successfully!"
else
  echo "Migration failed. See error messages above."
  exit 1
fi