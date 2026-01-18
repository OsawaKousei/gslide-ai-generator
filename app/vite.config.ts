/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr'; // 規約 6.2 SVG対応
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(), // SVGをReactコンポーネントとしてインポート可能にする
  ],
  resolve: {
    // 規約 4.1 エイリアス設定
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 規約 4.1 & 5.1 Docker環境対応
    host: true, // コンテナ外部からのアクセスを許可
    watch: {
      usePolling: true, // Docker Volumeでのファイル変更検知を確実にする
    },
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // 規約 4.1 Featureごとのチャンク分割戦略
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('src/features/')) {
            // src/features/xxx/... -> feature-xxx
            const featureName = id.split('src/features/')[1]?.split('/')[0];
            if (featureName) {
              return `feature-${featureName}`;
            }
          }
          return undefined;
        },
      },
    },
  },
});
