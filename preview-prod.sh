#!/bin/bash
set -e

IMAGE_NAME="vite-csr-app-prod"
PORT=8080

echo "========================================"
echo "Building Docker image: $IMAGE_NAME"
echo "========================================"
docker build -f Dockerfile.prod -t $IMAGE_NAME .

echo "========================================"
echo "Starting Nginx container for preview"
echo "URL: http://localhost:$PORT"
echo "Press Ctrl+C to stop"
echo "========================================"

docker run --rm -p $PORT:80 $IMAGE_NAME
