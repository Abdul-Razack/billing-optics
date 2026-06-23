import { test, expect } from '@playwright/test';

test.describe('Optics ERP Full Module End-to-End Tests', () => {
  // We will assume the Next.js app is running on localhost:3000
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto(`${BASE_URL}/login`);

    // We assume a seeded admin user for local development testing
    // Change this if the local test DB differs
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');

    // Wait for successful login and dashboard load by checking for the sidebar logo
    await page.waitForSelector('text=Optics ERP');
  });

  test('Module 1: Cashier Workflow (Checkout)', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices/new`);
    
    // Verify the Checkout Page rendered its critical elements
    await expect(page.locator('text=New Sale').first()).toBeVisible();
    await expect(page.locator('text=Search & Add Products').first()).toBeVisible();
  });

  test('Module 2: Optometrist Workflow (Prescriptions)', async ({ page }) => {
    await page.goto(`${BASE_URL}/prescriptions`);
    
    // Verify Prescriptions page loaded
    await expect(page.locator('text=Prescriptions').first()).toBeVisible();
    await expect(page.locator('text=New Prescription').first()).toBeVisible();
  });

  test('Module 3: Technician Workflow (Lab Jobs)', async ({ page }) => {
    await page.goto(`${BASE_URL}/lab-jobs`);
    
    // Verify Lab Jobs loads
    await expect(page.locator('text=Lab Jobs').first()).toBeVisible();
    await expect(page.locator('text=New Lab Job').first()).toBeVisible();
  });

  test('Module 4: Management Workflow (Reports & Analytics)', async ({ page }) => {
    await page.goto(`${BASE_URL}/reports/daily-statement`);
    
    // Check Analytics
    await expect(page.locator('text=Daily Statement').first()).toBeVisible();
    await expect(page.locator('text=Sales Summary').first()).toBeVisible();
  });

  test('Module 5: Settings & Customization', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    
    // Verify settings configuration defaults to Business Profile tab
    await expect(page.locator('text=System Settings').first()).toBeVisible();
    await expect(page.locator('text=Store Information').first()).toBeVisible();
    await expect(page.locator('text=Business Name').first()).toBeVisible();
  });
});
