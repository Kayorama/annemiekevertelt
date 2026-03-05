import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {

  test('sign in page renders correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sign-in');

    // Check that form is visible and properly sized
    await expect(page.locator('[data-testid="sign-in-form"]')).toBeVisible();

    // Check that input fields are full width
    const emailInput = page.locator('[data-testid="email-input"]');
    const emailBox = await emailInput.boundingBox();
    expect(emailBox?.width).toBeGreaterThan(300);

    // Check that button is accessible
    const signInButton = page.locator('[data-testid="sign-in-button"]');
    const buttonBox = await signInButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
  });

  test('dashboard adapts to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Sign in first
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');

    // Check that navigation is accessible (hamburger menu)
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Check that cards stack vertically
    const cards = page.locator('[data-testid="video-card"]');
    if (await cards.count() > 1) {
      const firstCard = await cards.nth(0).boundingBox();
      const secondCard = await cards.nth(1).boundingBox();

      // Cards should be stacked, not side by side
      expect(firstCard?.y).toBeLessThan(secondCard?.y || 0);
    }
  });

  test('editor shows mobile-optimized interface', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Sign in and navigate to editor
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');

    // Create new project
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'Mobile Test');
    await page.click('[data-testid="create-project-button"]');

    await page.waitForURL(/\/editor\/.+/);

    // Check mobile-specific elements
    await expect(page.locator('[data-testid="mobile-toolbar"]')).toBeVisible();

    // Timeline should be optimized for touch
    const timeline = page.locator('[data-testid="timeline-track"]');
    const timelineBox = await timeline.boundingBox();
    expect(timelineBox?.height).toBeGreaterThanOrEqual(60); // Larger touch target

    // Preview should be centered and scaled
    await expect(page.locator('[data-testid="mobile-preview-container"]')).toBeVisible();
  });

  test('timeline drag and drop works on touch devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Sign in and open editor
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');

    await page.click('[data-testid="video-card"]').first();

    // Check that clips have touch handles
    const clips = page.locator('[data-testid="timeline-clip"]');
    if (await clips.count() > 0) {
      const clip = clips.first();
      await expect(clip.locator('[data-testid="touch-handle-left"]')).toBeVisible();
      await expect(clip.locator('[data-testid="touch-handle-right"]')).toBeVisible();
    }
  });

  test('navigation menu works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Sign in
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');

    // Check that menu opens
    await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();

    // Navigate through menu items
    await page.click('[data-testid="nav-credits"]');
    await page.waitForURL('/credits');

    // Menu should close after selection
    await expect(page.locator('[data-testid="mobile-nav-menu"]')).not.toBeVisible();
  });

  test('credit purchase flow works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Sign in
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');

    // Navigate to credits
    await page.click('[data-testid="credit-balance"]');
    await page.waitForURL('/credits');

    // Check that credit packs are in scrollable row or stacked
    const packs = page.locator('[data-testid^="credit-pack-"]');
    expect(await packs.count()).toBeGreaterThan(0);

    // Select a pack
    await packs.first().click();

    // Checkout button should be easily tappable
    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    const buttonBox = await checkoutButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(48);
    expect(buttonBox?.width).toBeGreaterThan(200);
  });

  test('export flow optimized for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Sign in and open a project
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');

    await page.click('[data-testid="video-card"]').first();

    // Open export modal
    await page.click('[data-testid="export-button"]');

    // Check modal is full screen or properly sized
    const modal = page.locator('[data-testid="export-modal"]');
    const modalBox = await modal.boundingBox();

    // Modal should take most of the screen
    expect(modalBox?.width).toBeGreaterThan(300);

    // Quality options should be easily selectable
    const qualitySelect = page.locator('[data-testid="quality-select"]');
    const selectBox = await qualitySelect.boundingBox();
    expect(selectBox?.height).toBeGreaterThanOrEqual(44);

    // Start render button should be prominent
    const renderButton = page.locator('[data-testid="start-render-button"]');
    const renderBox = await renderButton.boundingBox();
    expect(renderBox?.height).toBeGreaterThanOrEqual(48);
  });

  test('landscape orientation on mobile', async ({ page }) => {
    // Set landscape viewport
    await page.setViewportSize({ width: 812, height: 375 });

    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');

    await page.click('[data-testid="video-card"]').first();

    // In landscape, editor should use side-by-side layout
    const preview = page.locator('[data-testid="preview-container"]');
    const timeline = page.locator('[data-testid="timeline-container"]');

    const previewBox = await preview.boundingBox();
    const timelineBox = await timeline.boundingBox();

    // Preview should be on the left, timeline on the right (or vice versa)
    expect(previewBox?.x).not.toEqual(timelineBox?.x);
  });

  test('font sizes readable on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // Smallest common size

    await page.goto('/sign-in');

    // Check that text is readable
    const heading = page.locator('h1');
    const fontSize = await heading.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Font size should be at least 16px
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16);

    // Check body text
    const bodyText = page.locator('p, label').first();
    const bodyFontSize = await bodyText.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    expect(parseInt(bodyFontSize)).toBeGreaterThanOrEqual(14);
  });

  test('no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');

    // Check document width matches viewport
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(documentWidth).toBeLessThanOrEqual(viewportWidth);
  });
});
