import { test, expect } from '@playwright/test';

test.describe('Optics ERP - Customers Module End-to-End Tests', () => {
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto(`${BASE_URL}/login`);

    // Login with seeded admin credentials
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');

    // Wait for successful login and dashboard load by checking for the sidebar logo
    await page.waitForSelector('text=Optics ERP');
  });

  test('Module: All Customers', async ({ page }) => {
    await page.goto(`${BASE_URL}/customers`);
    
    // Verify the Customers Page rendered
    await expect(page.locator('text=Customers').first()).toBeVisible();
    await expect(page.locator('text=Add Customer').first()).toBeVisible();
  });

  test('Module: Marketing Hub (Birthdays & Anniversaries)', async ({ page }) => {
    await page.goto(`${BASE_URL}/customers/marketing`);
    
    // Verify the Marketing Hub loaded
    await expect(page.locator('text=Marketing Hub').first()).toBeVisible();
    await expect(page.locator('text=Birthdays this month').first()).toBeVisible();
    await expect(page.locator('text=Anniversaries this month').first()).toBeVisible();
  });

  test('Module: Offers & Coupons', async ({ page }) => {
    await page.goto(`${BASE_URL}/customers/offers`);
    
    // Verify the Offers Page loaded
    await expect(page.locator('text=Offers & Coupons').first()).toBeVisible();
    await expect(page.locator('text=Create Offer').first()).toBeVisible();
  });

  test('Module: Referral Network', async ({ page }) => {
    await page.goto(`${BASE_URL}/customers/referrals`);
    
    // Verify the Referral Network page loaded
    await expect(page.locator('text=Referral Network').first()).toBeVisible();
    await expect(page.locator('text=Top Referrers').first()).toBeVisible();
  });

  test('Module: Loyalty Program', async ({ page }) => {
    await page.goto(`${BASE_URL}/customers/loyalty`);
    
    // Verify the Loyalty Program page loaded
    await expect(page.locator('text=Loyalty Program').first()).toBeVisible();
    await expect(page.locator('text=Loyalty Leaderboard').first()).toBeVisible();
  });
});
