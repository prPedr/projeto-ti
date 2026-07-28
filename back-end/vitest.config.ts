import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'segredo_de_teste_para_vitest_123',
    },
    globals: true,
    testTimeout: 10000,
  },
})
