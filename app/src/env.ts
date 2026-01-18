import { z } from 'zod';

// Viteの標準環境変数 + アプリ固有の環境変数
const envSchema = z.object({
  BASE_URL: z.string().default('/'),
  MODE: z.string().default('development'),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(false),
  SSR: z.boolean().default(false),
});

// import.meta.env を検証してエクスポート
// バリデーションエラー時は例外がスローされ、アプリ起動が停止する（Strict Runtime）
export const env = envSchema.parse(import.meta.env);
