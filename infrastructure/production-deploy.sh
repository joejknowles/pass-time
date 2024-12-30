#!/bin/bash

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

echo "Building the project..."
yarn build --no-lint

echo "Restarting the server..."
pm2 restart nextjs

echo "Deployment complete!"
