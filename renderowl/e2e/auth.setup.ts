import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to sign up page
  await page.goto('/sign-up');

  // Fill in sign up form with test user
  await page.fill('[data-testid="email-input"]', 'test-e2e@renderowl.test');
  await page.fill('[data-testid="password-input"]', 'TestPassword123!');
  await page.click('[data-testid="sign-up-button"]');

  // Wait for dashboard redirect
  await page.waitForURL('/dashboard', { timeout: 30000 });

  // Verify we're on the dashboard
  await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible();

  // Save storage state for other tests
  await page.context().storageState({ path: authFile });
});
