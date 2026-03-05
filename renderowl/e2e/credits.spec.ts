import { test, expect } from '@playwright/test';

test.describe('Credit Purchase Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');
  });

  test('view credit balance', async ({ page }) => {
    await expect(page.locator('[data-testid="credit-balance"]')).toBeVisible();
    await expect(page.locator('[data-testid="credit-amount"]')).toHaveText(/\d+/);
  });

  test('navigate to credits page', async ({ page }) => {
    await page.click('[data-testid="credit-balance"]');
    await page.waitForURL('/credits');

    await expect(page.locator('h1')).toContainText('Credits');
    await expect(page.locator('[data-testid="current-balance"]')).toBeVisible();
    await expect(page.locator('[data-testid="purchase-options"]')).toBeVisible();
  });

  test('purchase credit pack with Stripe', async ({ page }) => {
    test.setTimeout(60000);

    await test.step('Navigate to credits page', async () => {
      await page.goto('/credits');
    });

    await test.step('Select credit pack', async () => {
      // Click on a credit pack
      await page.click('[data-testid="credit-pack-100"]');

      // Verify pack is selected
      await expect(page.locator('[data-testid="credit-pack-100"]')).toHaveClass(/selected/);
    });

    await test.step('Proceed to checkout', async () => {
      await page.click('[data-testid="checkout-button"]');

      // Wait for Stripe Elements to load
      await expect(page.locator('[data-testid="stripe-payment-form"]')).toBeVisible();
    });

    await test.step('Fill payment details', async () => {
      // Fill card number (Stripe test card: 4242 4242 4242 4242)
      await page.fill('[data-testid="card-number-input"]', '4242 4242 4242 4242');
      await page.fill('[data-testid="card-expiry-input"]', '12/30');
      await page.fill('[data-testid="card-cvc-input"]', '123');
      await page.fill('[data-testid="card-postal-input"]', '12345');
    });

    await test.step('Complete purchase', async () => {
      await page.click('[data-testid="pay-button"]');

      // Wait for success
      await expect(page.locator('[data-testid="purchase-success"]')).toBeVisible({ timeout: 30000 });
    });

    await test.step('Verify credits added', async () => {
      await page.goto('/dashboard');
      const balanceText = await page.locator('[data-testid="credit-amount"]').textContent();
      const balance = parseInt(balanceText || '0', 10);
      expect(balance).toBeGreaterThanOrEqual(100);
    });
  });

  test('handle declined payment', async ({ page }) => {
    await test.step('Navigate to checkout', async () => {
      await page.goto('/credits');
      await page.click('[data-testid="credit-pack-100"]');
      await page.click('[data-testid="checkout-button"]');
    });

    await test.step('Use declined card', async () => {
      // Declined card: 4000 0000 0000 0002
      await page.fill('[data-testid="card-number-input"]', '4000 0000 0000 0002');
      await page.fill('[data-testid="card-expiry-input"]', '12/30');
      await page.fill('[data-testid="card-cvc-input"]', '123');
      await page.click('[data-testid="pay-button"]');
    });

    await test.step('Verify error handling', async () => {
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/declined|failed/i);

      // Should still be on payment page to retry
      await expect(page.locator('[data-testid="stripe-payment-form"]')).toBeVisible();
    });
  });

  test('view credit transaction history', async ({ page }) => {
    await page.goto('/credits');
    await page.click('[data-testid="transaction-history-tab"]');

    await expect(page.locator('[data-testid="transaction-list"]')).toBeVisible();

    // Should show transactions
    const transactions = page.locator('[data-testid="transaction-item"]');
    await expect(transactions.first()).toBeVisible();
  });

  test('credit usage shown per operation', async ({ page }) => {
    await test.step('Open editor with new project', async () => {
      await page.click('[data-testid="new-project-button"]');
      await page.fill('[data-testid="project-name-input"]', 'Credit Test');
      await page.click('[data-testid="create-project-button"]');
    });

    await test.step('Verify credit estimation', async () => {
      // Should show estimated cost
      await expect(page.locator('[data-testid="credit-estimate"]')).toBeVisible();

      // Based on duration and quality
      await page.selectOption('[data-testid="quality-select"]', '4k');

      // Credit estimate should update
      const estimate = await page.locator('[data-testid="credit-estimate-amount"]').textContent();
      expect(parseInt(estimate || '0', 10)).toBeGreaterThan(0);
    });
  });

  test('apply promo code', async ({ page }) => {
    await test.step('Navigate to credits', async () => {
      await page.goto('/credits');
      await page.click('[data-testid="credit-pack-100"]');
    });

    await test.step('Apply promo code', async () => {
      await page.click('[data-testid="promo-code-toggle"]');
      await page.fill('[data-testid="promo-code-input"]', 'TEST50');
      await page.click('[data-testid="apply-promo-button"]');

      // Verify discount applied
      await expect(page.locator('[data-testid="promo-applied"]')).toBeVisible();
      await expect(page.locator('[data-testid="discount-amount"]')).toContainText('%');
    });
  });
});
