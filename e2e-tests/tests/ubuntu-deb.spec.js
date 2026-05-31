const { _electron: electron, test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

test.describe('Ubuntu .deb Validation', () => {
  let electronApp;
  let userDataPath;
  let logs = {
    backend: [],
    frontend: [],
    startup: []
  };
  let window;

  const appExecutablePath = '/opt/Billing Optics ERP/billing-optics-erp';
  
  test.beforeAll(async () => {
    userDataPath = path.join(os.homedir(), '.config', 'billing-optics-erp');
    if (fs.existsSync(userDataPath)) {
      fs.rmSync(userDataPath, { recursive: true, force: true });
    }
    
    // Ensure screenshot directory exists
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
  });

  async function launchApp() {
    electronApp = await electron.launch({
      executablePath: appExecutablePath,
      args: ['--no-sandbox']
    });

    electronApp.process().stdout.on('data', (data) => {
      const msg = data.toString();
      logs.startup.push(msg);
      if (msg.includes('[Backend]')) logs.backend.push(msg);
      if (msg.includes('[Frontend]')) logs.frontend.push(msg);
    });
    
    electronApp.process().stderr.on('data', (data) => {
      logs.startup.push(data.toString());
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  }

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test.afterAll(() => {
    fs.writeFileSync('screenshots/startup_logs.txt', logs.startup.join(''));
    fs.writeFileSync('screenshots/backend_logs.txt', logs.backend.join(''));
    fs.writeFileSync('screenshots/frontend_logs.txt', logs.frontend.join(''));
  });

  test('Verify fresh installation triggers onboarding and completes setup', async () => {
    await launchApp();

    // Verify Onboarding
    const title = await window.title();
    expect(title).toBe('Billing Optics ERP - Setup');
    await window.screenshot({ path: 'screenshots/1-onboarding.png' });

    // Step 1: Company Details
    await window.fill('#companyName', 'Test Company');
    await window.fill('#ownerName', 'Test Owner');
    await window.fill('#phone', '1234567890');
    await window.fill('#email', 'test@example.com');
    await window.click('button[type="submit"]');

    // Step 2: Database Setup
    // It should detect the PostgreSQL we installed in GitHub Actions
    await window.waitForSelector('#db-config-form:not(.hidden)');
    const testUser = process.env.TEST_PG_USER;
    const testPass = process.env.TEST_PG_PASS;
    if (!testUser || !testPass) {
      throw new Error("TEST_PG_USER and TEST_PG_PASS environment variables must be set.");
    }
    await window.fill('#adminUser', testUser);
    await window.fill('#adminPass', testPass);
    
    await window.click('#testConnBtn');
    await window.waitForSelector('#db-success:not(.hidden)', { timeout: 10000 });
    await window.screenshot({ path: 'screenshots/2-postgresql-setup.png' });
    
    await window.click('#continueToStep3');

    // Wait for setup to complete (Step 4)
    await window.waitForSelector('#step-4.active', { timeout: 30000 });
    await window.screenshot({ path: 'screenshots/3-setup-success.png' });

    // Verify config file is generated
    const envFile = path.join(userDataPath, '.env');
    expect(fs.existsSync(envFile)).toBeTruthy();
    
    // Launch Application
    await window.click('#launchBtn');
    
    // The onboarding window closes and main window opens, we need to wait for the new window
    window = await electronApp.waitForEvent('window');
    await window.waitForLoadState('domcontentloaded');
    
    const newTitle = await window.title();
    expect(newTitle).toBe('Billing Optics ERP');
    
    // Wait for the servers to be ready
    await window.waitForTimeout(5000); // give servers time to bind ports
    
    // The main window will eventually redirect or load the localhost:3000
    await window.screenshot({ path: 'screenshots/4-dashboard.png' });

    // Verify HTTP endpoints
    const { request } = require('@playwright/test');
    const apiContext = await request.newContext();
    
    const healthRes = await apiContext.get('http://localhost:5000/health');
    expect(healthRes.status()).toBe(200);

    const htmlRes = await apiContext.get('http://localhost:3000');
    expect(htmlRes.status()).toBe(200);
    const htmlBody = await htmlRes.text();
    expect(htmlBody).toContain('<!DOCTYPE html>');
  });

  test('Verify app relaunches and skips onboarding', async () => {
    // Relaunch the application after setup is complete
    await launchApp();
    
    const title = await window.title();
    expect(title).toBe('Billing Optics ERP'); // Should not be Setup
    
    await window.waitForTimeout(3000);
    await window.screenshot({ path: 'screenshots/5-relaunch-dashboard.png' });
    
    // The endpoints should be accessible again
    const { request } = require('@playwright/test');
    const apiContext = await request.newContext();
    
    const healthRes = await apiContext.get('http://localhost:5000/health');
    expect(healthRes.status()).toBe(200);
  });
});
