import { test, expect } from '@playwright/test';

test.describe('Browser Console Error Monitoring', () => {
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    networkErrors.length = 0;

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });

    // Listen for failed network requests
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()}: ${response.url()}`);
      }
    });
  });

  test.afterEach(async () => {
    // Log errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    if (networkErrors.length > 0) {
      console.log('Network errors:', networkErrors);
    }
  });

  test('no console errors on sign in page', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
    expect(networkErrors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('no console errors on dashboard', async ({ page }) => {
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
    expect(networkErrors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('no console errors in editor', async ({ page }) => {
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');

    await page.click('[data-testid="video-card"]').first();
    await page.waitForURL(/\/editor\/.+/);
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test('no React hydration errors', async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('hydrat') || text.includes('Hydration') ||
          text.includes('did not match') || text.includes('Text content does not match')) {
        hydrationErrors.push(text);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(hydrationErrors).toHaveLength(0);
  });

  test('no memory leaks on navigation', async ({ page }) => {
    const memorySnapshots: number[] = [];

    await page.goto('/sign-in');
    await page.waitForTimeout(1000);

    // Take memory snapshot
    const heap1 = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
    memorySnapshots.push(heap1);

    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/dashboard');
      await page.waitForTimeout(500);
      await page.goto('/credits');
      await page.waitForTimeout(500);
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if (window.gc) window.gc();
    });

    await page.waitForTimeout(1000);

    const heap2 = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
    memorySnapshots.push(heap2);

    // Memory should not grow unbounded (allow 50% growth)
    const growthRatio = heap2 / heap1;
    expect(growthRatio).toBeLessThan(1.5);
  });

  test('no errors during video operations', async ({ page }) => {
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');

    await page.click('[data-testid="video-card"]').first();
    await page.waitForURL(/\/editor\/.+/);

    // Clear errors from initial load
    consoleErrors.length = 0;

    // Interact with video
    await page.click('[data-testid="play-button"]');
    await page.waitForTimeout(1000);

    await page.click('[data-testid="pause-button"]');
    await page.waitForTimeout(500);

    await page.click('[data-testid="timeline-clip"]').first();
    await page.waitForTimeout(500);

    expect(consoleErrors).toHaveLength(0);
  });
});
