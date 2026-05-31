const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: {
    timeout: 15000
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry'
  },
});
