/// <reference types="vite/client" />
import type { z } from 'zod';
import type { envSchema } from './env';

type Env = z.infer<envSchema>;

/* eslint-disable no-restricted-syntax, @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type */
declare global {
  interface ImportMetaEnv extends Env {}

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
/* eslint-enable */
