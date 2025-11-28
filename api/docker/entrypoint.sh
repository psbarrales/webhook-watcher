#!/bin/sh

set -e

if [ -z "$NODE_ENV" ]; then
  echo "NODE_ENV is missing"
  exit 1
fi

if [ "$NODE_ENV" = "production" ]; then
  PORT=3000 npm run prod &
else
  PORT=3000 npm run dev &
fi

nginx -g 'daemon off;'
