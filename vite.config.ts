import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: '/powerscaling-tools/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: `${projectRoot}/index.html`,
        power: `${projectRoot}/power.html`,
        upgrade: `${projectRoot}/upgrade.html`,
        magic: `${projectRoot}/shipin/km_cal.html`,
        materials: `${projectRoot}/shipin/materials.html`,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
