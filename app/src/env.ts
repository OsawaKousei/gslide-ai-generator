import { z } from 'zod';

export const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('https://www.googleapis.com'),
  VITE_GOOGLE_CLIENT_ID: z.string().min(1).optional(), // 開発初期はOptionalにしておく
});

// 検証失敗時はアプリ起動時に即座にエラー (Fail Fast)
export const env = envSchema.parse(import.meta.env);
