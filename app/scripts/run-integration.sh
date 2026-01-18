#!/bin/bash

# .env.test があれば読み込む
if [ -f .env.test ]; then
  echo "Loading environment variables from .env.test..."
  # コメント行を除外し、exportする
  export $(grep -v '^#' .env.test | xargs)
fi

# 統合テストの実行
echo "Running Google API Integration Test..."
npm test src/features/generator/utils/integration.test.ts
