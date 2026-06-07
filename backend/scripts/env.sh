#!/bin/bash
# Shared environment setup for backend scripts

ENVIRONMENT="${ENVIRONMENT:-development}"

if [[ "${ENVIRONMENT}" == "production" ]]; then
  echo "Starting in production mode..."
  export NODE_ENV="production"
  # DATABASE_URL is provided by the Railway Postgres service (do not override it here).
else
  echo "Starting in development mode..."
  export NODE_ENV="development"
fi
