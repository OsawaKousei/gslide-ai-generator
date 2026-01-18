import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './test/setup.ts',
      include: [
        'src/**/*.test.{js,ts,jsx,tsx}',
        'test/**/*.test.{js,ts,jsx,tsx}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.spec.tsx',
        'playwright/**',
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/features/gomoku/**/*.{ts,tsx}'],
        exclude: [
          'src/features/gomoku/**/index.ts',
          'src/features/gomoku/types.ts',
        ],
      },
    },
  }),
);
