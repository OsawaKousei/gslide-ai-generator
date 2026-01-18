/// <reference types="vite/client" />
import { z } from 'zod';
import { envSchema } from './env';

type Env = z.infer<typeof envSchema>;

interface ImportMetaEnv extends Env {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
