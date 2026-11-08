import { defineConfig } from 'vite'

// Vite bouwt de single-page site; Vitest (unit tests) gebruikt dezelfde config.
export default defineConfig({
  build: {
    target: 'es2022',
    // three.js is groot; één bundel is hier prima, dus de waarschuwing mag hoger.
    chunkSizeWarningLimit: 1200,
  },
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
  },
})
