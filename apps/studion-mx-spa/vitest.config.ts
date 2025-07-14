// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    setupFiles: './tests/setupTest.ts',
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      cleanOnRerun: true,
      skipFull: true,
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        'src/types/**', 
        'src/main.ts',
        'src/plugins/**',
        'src/router/**',
        'src/support/utils/**',
        'src/support/i18n/**',
        'src/support/http/**',
        'src/assets/**',
        'src/stores/**',
        '**/__mocks__/**',
        '**/\x00vite*',
        'vitest.config.ts',
        'vite.config.ts',
        'tailwind.config.js',
        'postcss.config.cjs',
        'src/App.vue',
        'src/config.js',
      ],
    },
  },
});
