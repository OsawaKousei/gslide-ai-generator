#!/bin/bash

# .env.test があれば読み込む
if [ -f .env.test ]; then
  echo "Loading environment variables from .env.test..."
  export $(grep -v '^#' .env.test | xargs)
fi

# スクリプトを実行 (tsxが必要だが、ここではvitestなどが使っているesbuild-register的なものを使うか、node --loader等で実行)
# 簡易的に npx tsx を使用
npx tsx scripts/get-refresh-token.ts
