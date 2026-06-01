const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 300000,
  expect: {
    timeout: 30000
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    actionTimeout: 30000,
    navigationTimeout: 60000,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry'
  },
});
