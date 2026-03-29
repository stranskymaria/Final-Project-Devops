import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import appVersion from '../app-version.json';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const buildSha = process.env.APP_BUILD_SHA?.trim();
    const deployColor = process.env.APP_DEPLOY_COLOR?.trim().toLowerCase() ?? '';
    const appDisplayVersion = buildSha ? `${appVersion.version}+${buildSha}` : appVersion.version;
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        __APP_VERSION__: JSON.stringify(appVersion.version),
        __APP_DISPLAY_VERSION__: JSON.stringify(appDisplayVersion),
        __APP_BUILD_SHA__: JSON.stringify(buildSha ?? ''),
        __APP_DEPLOY_COLOR__: JSON.stringify(deployColor),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: true,
      },
    };
});
