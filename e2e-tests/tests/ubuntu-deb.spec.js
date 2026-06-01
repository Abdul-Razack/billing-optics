const { _electron: electron, test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

test.describe('Ubuntu .deb Validation - Fresh Machine', () => {
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
    userDataPath = path.join(os.homedir(), '.config', 'Billing Optics ERP');
    if (fs.existsSync(userDataPath)) {
      fs.rmSync(userDataPath, { recursive: true, force: true });
    }
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
    try {
      const crashLog = path.join(userDataPath, 'crash.log');
      if (fs.existsSync(crashLog)) fs.copyFileSync(crashLog, 'screenshots/crash.log');
      const rejectionLog = path.join(userDataPath, 'rejection.log');
      if (fs.existsSync(rejectionLog)) fs.copyFileSync(rejectionLog, 'screenshots/rejection.log');
    } catch(e) {}
    try {
      const journal = execSync('journalctl -xe --no-pager | tail -n 100').toString();
      fs.writeFileSync('screenshots/journalctl.txt', journal);
    } catch (e) {}
    try {
      const ss = execSync('ss -tulpn').toString();
      fs.writeFileSync('screenshots/ss_output.txt', ss);
    } catch (e) {}
  });

  test('Stage 1-4: Onboarding, Provisioning, and Startup', async () => {
    await launchApp();

    const title = await window.title();
    expect(title).toBe('Billing Optics ERP - Setup');
    await window.screenshot({ path: 'screenshots/1-onboarding.png' });

    // Step 1: Company Details
    await window.fill('#companyName', 'Test Company');
    await window.fill('#ownerName', 'Test Owner');
    await window.fill('#phone', '1234567890');
    await window.fill('#email', 'test@example.com');
    await window.click('button[type="submit"]');
    console.log('[E2E] Onboarding submitted');

    // Step 2: Ensure auto install route triggers
    await window.waitForSelector('#db-not-installed:not(.hidden)');
    await window.screenshot({ path: 'screenshots/2-db-not-installed.png' });
    await window.click('#startAutoInstall');
    console.log('[E2E] PostgreSQL installation started');
    
    // Poll localhost:5432 every 5 seconds
    for (let i = 0; i < 36; i++) {
      try {
        const ss = execSync('ss -tulpn').toString();
        if (ss.includes(':5432')) {
          console.log('[E2E] PostgreSQL detected');
          break;
        }
      } catch (e) {}
      await window.waitForTimeout(5000);
    }
    
    // Wait for setup to complete (Step 4)
    await window.waitForSelector('#step-4.active', { timeout: 180000 }); // Installation can take a couple minutes
    console.log('[E2E] PostgreSQL installation completed');
    await window.screenshot({ path: 'screenshots/3-setup-success.png' });

    // Verify config file is generated
    const configFile = path.join(userDataPath, 'config.json');
    expect(fs.existsSync(configFile)).toBeTruthy();
    console.log('[E2E] Config generated');
    fs.copyFileSync(configFile, 'screenshots/config.json');
    
    // Stage 3 Provisioning Verification
    try {
      fs.writeFileSync('screenshots/pg_isready.txt', execSync('pg_isready').toString());
      fs.writeFileSync('screenshots/pg_dbs.txt', execSync('sudo -u postgres psql -c "\\l"').toString());
      fs.writeFileSync('screenshots/pg_users.txt', execSync('sudo -u postgres psql -c "\\du"').toString());
    } catch (e) {
      console.log('Failed to run psql verification commands:', e.message);
    }
    
    // Launch Application
    await window.click('#launchBtn');
    
    // The onboarding window closes and main window opens
    window = await electronApp.waitForEvent('window');
    await window.waitForLoadState('domcontentloaded');
    
    const newTitle = await window.title();
    expect(newTitle).toBe('Billing Optics ERP');
    
    // Wait for servers to settle
    await window.waitForTimeout(5000); 
    await window.screenshot({ path: 'screenshots/4-dashboard.png' });

    // Verify HTTP endpoints (Stage 4)
    const { request } = require('@playwright/test');
    const apiContext = await request.newContext();
    
    const healthRes = await apiContext.get('http://localhost:5000/api/health');
    expect(healthRes.status()).toBe(200);
    console.log('[E2E] Backend healthy');
    fs.writeFileSync('screenshots/health.json', await healthRes.text());
  });

  test('Stage 5: Verify app relaunches and skips onboarding', async () => {
    await launchApp();
    
    const title = await window.title();
    expect(title).toBe('Billing Optics ERP');
    
    await window.waitForTimeout(3000);
    await window.screenshot({ path: 'screenshots/5-relaunch-dashboard.png' });
    
    const { request } = require('@playwright/test');
    const apiContext = await request.newContext();
    const healthRes = await apiContext.get('http://localhost:5000/api/health');
    expect(healthRes.status()).toBe(200);
  });
});
