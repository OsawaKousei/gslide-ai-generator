#!/bin/bash
set -e

IMAGE_NAME="vite-csr-app-prod"
CONTAINER_NAME="vite-csr-app-prod-extract"
OUTPUT_DIR="dist"

echo "========================================"
echo "Building Docker image: $IMAGE_NAME"
echo "========================================"
docker build -f Dockerfile.prod -t $IMAGE_NAME .

echo "========================================"
echo "Extracting build artifacts to ./$OUTPUT_DIR"
echo "========================================"

# 既存の出力ディレクトリがあれば削除
if [ -d "$OUTPUT_DIR" ]; then
    echo "Removing existing $OUTPUT_DIR..."
    rm -rf "$OUTPUT_DIR"
fi

# 一時コンテナを作成（実行はしない）
docker create --name $CONTAINER_NAME $IMAGE_NAME

# コンテナからdistディレクトリをホストにコピー
docker cp $CONTAINER_NAME:/usr/share/nginx/html ./$OUTPUT_DIR

# 一時コンテナを削除
docker rm $CONTAINER_NAME

echo "========================================"
echo "Build complete!"
echo "Artifacts are located in: $(pwd)/$OUTPUT_DIR"
echo "You can deploy these files to AWS S3 + CloudFront or any static hosting."
echo "========================================"
