#!/bin/bash

# .env.test があれば読み込む
if [ -f .env.test ]; then
  echo "Loading environment variables from .env.test..."
  export $(grep -v '^#' .env.test | xargs)
fi

# スクリプトを実行
npx tsx scripts/create-template.ts
