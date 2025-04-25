import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    rollupOptions: {
      // 处理无法解析的静态资源路径
      onwarn(warning, warn) {
        // 忽略特定的警告
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.message.includes('drone-icon.png')) {
          return;
        }
        warn(warning);
      }
    }
  }
});
