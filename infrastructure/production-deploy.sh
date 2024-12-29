#!/bin/bash

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
yarn install

echo "Building the project..."
yarn build

echo "Restarting the server..."
pm2 restart nextjs

echo "Deployment complete!"
