#!/usr/bin/env sh
# Loads public env vars for `next build` (production mode does not read .env.development).
set -a
if [ -f .env.development ]; then
  # shellcheck disable=SC1091
  . ./.env.development
elif [ -f .env.example ]; then
  # shellcheck disable=SC1091
  . ./.env.example
fi
set +a
exec "$@"
