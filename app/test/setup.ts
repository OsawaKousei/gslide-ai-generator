import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 各テスト後にクリーンアップを行う
afterEach(() => {
  cleanup();
});
