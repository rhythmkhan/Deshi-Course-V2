import { defineConfig } from 'eslint/config';
import next from 'eslint-config-next';

export default defineConfig([
  {
    ignores: [
      '.next/**',
      '.next-dev/**',
      '.next-build/**',
      'coverage/**',
      'node_modules/**',
      'test-results/**',
      'tmp/**',
    ],
  },
  {
    extends: [...next],
  },
]);
