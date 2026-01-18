import '../src/index.css';
import './index.css';
import {
  beforeMount,
  afterMount,
} from '@playwright/experimental-ct-react/hooks';

export type HooksConfig = {
  // ...
};

beforeMount(async ({ hooksConfig }) => {
  // ...
});

afterMount(async () => {
  // ...
});
