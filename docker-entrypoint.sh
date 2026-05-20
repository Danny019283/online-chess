#!/bin/sh
# Wait for backend to be resolvable via Docker's embedded DNS
until getent hosts backend > /dev/null 2>&1; do
  echo "Waiting for backend..."
  sleep 1
done
echo "Backend is up, starting nginx..."
exec nginx -g "daemon off;"