// vitest.config.integration.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      include: ['src/**/integration.test.ts', 'src/**/*.integration.test.ts'],
      environment: 'node', // Use node environment for API integration tests
      // 統合テストは重いので並列数を制限したり、分離独立させたりする場合の設定もここに書ける
      fileParallelism: false, // 念のため直列実行（APIレートリミット対策）
    },
  }),
);
