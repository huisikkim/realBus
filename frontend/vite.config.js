import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // 로컬 개발용 (배포 시 '/realBus/'로 변경)
});
