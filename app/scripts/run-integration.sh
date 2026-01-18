#!/bin/bash

# .env.test があれば読み込んで環境変数としてエクスポート
if [ -f .env.test ]; then
  echo "Loading environment variables from .env.test..."
  set -o allexport
  source .env.test
  set +o allexport
fi

echo "Running Integration Tests..."
# 引数("$@")を Vitest にそのまま渡すことで、ファイルフィルタリングが可能になる
# Configファイルで include: ['**/*.integration.test.ts'] が指定されているため、
# フィルタを指定しても統合テスト以外が実行されることはない。
npx vitest run -c vitest.config.integration.ts "$@"
