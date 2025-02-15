#!/bin/bash

set -e

if [ "$(basename $(pwd))" != "pass-time" ]; then
    cd "./pass-time" || {
        echo "Error: Could not find or enter the 'pass-time' directory."
        exit 1
    }
fi

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
yarn install

echo "Applying migrations..."
yarn prisma-deploy

echo "generating prisma client..."
yarn gc

echo "Building the project..."
yarn build

echo "Restarting the server..."
pm2 restart nextjs --update-env

echo "Deployment complete!"
