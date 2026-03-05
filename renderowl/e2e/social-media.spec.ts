import { test, expect } from '@playwright/test';

test.describe('Social Media Publishing (YouTube/TikTok)', () => {

  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');
  });

  test('connect YouTube account', async ({ page }) => {
    await test.step('Navigate to social connections', async () => {
      await page.click('[data-testid="user-menu-button"]');
      await page.click('[data-testid="settings-option"]');
      await page.click('[data-testid="social-connections-tab"]');
    });

    await test.step('Connect YouTube', async () => {
      // Mock YouTube OAuth flow
      await page.click('[data-testid="connect-youtube-button"]');

      // In test mode, we mock the OAuth popup
      await page.evaluate(() => {
        window.open = () => {
          // Simulate OAuth callback
          window.location.href = '/api/auth/youtube/callback?code=mock_code';
          return null as any;
        };
      });

      await page.click('[data-testid="connect-youtube-button"]');

      // Wait for connection to be established
      await expect(page.locator('[data-testid="youtube-connected"]')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('[data-testid="youtube-channel-name"]')).toBeVisible();
    });
  });

  test('connect TikTok account', async ({ page }) => {
    await test.step('Navigate to social connections', async () => {
      await page.click('[data-testid="user-menu-button"]');
      await page.click('[data-testid="settings-option"]');
      await page.click('[data-testid="social-connections-tab"]');
    });

    await test.step('Connect TikTok', async () => {
      await page.click('[data-testid="connect-tiktok-button"]');

      // Wait for TikTok auth window (mocked)
      await page.evaluate(() => {
        window.open = () => {
          window.location.href = '/api/auth/tiktok/callback?code=mock_tiktok_code';
          return null as any;
        };
      });

      await page.click('[data-testid="connect-tiktok-button"]');

      await expect(page.locator('[data-testid="tiktok-connected"]')).toBeVisible({ timeout: 30000 });
    });
  });

  test('publish video to YouTube', async ({ page }) => {
    test.setTimeout(120000);

    await test.step('Open published video', async () => {
      await page.goto('/dashboard');
      await page.click('[data-testid="video-card"]').first();
    });

    await test.step('Initiate YouTube publish', async () => {
      await page.click('[data-testid="publish-button"]');
      await page.click('[data-testid="publish-youtube-option"]');
    });

    await test.step('Fill YouTube metadata', async () => {
      await page.fill('[data-testid="youtube-title-input"]', 'Test Video from RenderOwl E2E');
      await page.fill('[data-testid="youtube-description-input"]', 'This is an automated test video upload');

      // Select privacy setting
      await page.selectOption('[data-testid="youtube-privacy-select"]', 'private');

      // Add tags
      await page.fill('[data-testid="youtube-tags-input"]', 'test,renderowl,e2e');

      // Select category
      await page.selectOption('[data-testid="youtube-category-select"]', '22'); // People & Blogs
    });

    await test.step('Publish to YouTube', async () => {
      await page.click('[data-testid="confirm-publish-button"]');

      // Wait for publish to start
      await expect(page.locator('[data-testid="publish-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="publish-status"]')).toContainText('Publishing to YouTube');
    });

    await test.step('Verify publish success', async () => {
      // Wait for success notification
      await expect(page.locator('[data-testid="publish-success"]')).toBeVisible({ timeout: 60000 });

      // Verify YouTube URL is shown
      await expect(page.locator('[data-testid="youtube-video-url"]')).toBeVisible();
      await expect(page.locator('[data-testid="youtube-video-url"]')).toContainText('youtube.com');
    });
  });

  test('publish video to TikTok', async ({ page }) => {
    test.setTimeout(120000);

    await test.step('Open published video', async () => {
      await page.goto('/dashboard');
      await page.click('[data-testid="video-card"]').first();
    });

    await test.step('Initiate TikTok publish', async () => {
      await page.click('[data-testid="publish-button"]');
      await page.click('[data-testid="publish-tiktok-option"]');
    });

    await test.step('Fill TikTok metadata', async () => {
      await page.fill(
        '[data-testid="tiktok-description-input"]',
        'Check out this video! #renderowl #test #fyp'
      );

      // Enable/disable features
      await page.click('[data-testid="tiktok-allow-comments-checkbox"]');
      await page.click('[data-testid="tiktok-allow-duet-checkbox"]');
    });

    await test.step('Publish to TikTok', async () => {
      await page.click('[data-testid="confirm-publish-button"]');

      await expect(page.locator('[data-testid="publish-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="publish-status"]')).toContainText('Publishing to TikTok');
    });

    await test.step('Verify publish success', async () => {
      await expect(page.locator('[data-testid="publish-success"]')).toBeVisible({ timeout: 60000 });
      await expect(page.locator('[data-testid="tiktok-video-url"]')).toBeVisible();
    });
  });

  test('schedule video publish for later', async ({ page }) => {
    await test.step('Open video and select schedule', async () => {
      await page.goto('/dashboard');
      await page.click('[data-testid="video-card"]').first();
      await page.click('[data-testid="publish-button"]');
      await page.click('[data-testid="publish-youtube-option"]');
    });

    await test.step('Set scheduled time', async () => {
      await page.fill('[data-testid="youtube-title-input"]', 'Scheduled Test Video');
      await page.fill('[data-testid="youtube-description-input"]', 'This video is scheduled for later');

      // Select schedule option instead of immediate publish
      await page.click('[data-testid="schedule-radio"]');

      // Set publish time to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);

      await page.fill('[data-testid="schedule-datetime-input"]', tomorrow.toISOString().slice(0, 16));
    });

    await test.step('Schedule video', async () => {
      await page.click('[data-testid="schedule-publish-button"]');

      await expect(page.locator('[data-testid="schedule-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="scheduled-time-display"]')).toBeVisible();
    });
  });

  test('disconnect social account', async ({ page }) => {
    await test.step('Navigate to social connections', async () => {
      await page.click('[data-testid="user-menu-button"]');
      await page.click('[data-testid="settings-option"]');
      await page.click('[data-testid="social-connections-tab"]');
    });

    await test.step('Disconnect YouTube', async () => {
      // First ensure YouTube is connected
      await expect(page.locator('[data-testid="youtube-connected"]')).toBeVisible();

      // Click disconnect
      await page.click('[data-testid="disconnect-youtube-button"]');

      // Confirm disconnect
      await page.click('[data-testid="confirm-disconnect-button"]');

      // Verify disconnected
      await expect(page.locator('[data-testid="youtube-disconnected"]')).toBeVisible();
      await expect(page.locator('[data-testid="connect-youtube-button"]')).toBeVisible();
    });
  });

  test('handle publish failure gracefully', async ({ page }) => {
    await test.step('Simulate publish failure', async () => {
      await page.goto('/dashboard');
      await page.click('[data-testid="video-card-failing"]'); // Special test video that fails
      await page.click('[data-testid="publish-button"]');
      await page.click('[data-testid="publish-youtube-option"]');
    });

    await test.step('Fill metadata and attempt publish', async () => {
      await page.fill('[data-testid="youtube-title-input"]', 'Failing Test Video');
      await page.click('[data-testid="confirm-publish-button"]');
    });

    await test.step('Verify error handling', async () => {
      // Should show error message
      await expect(page.locator('[data-testid="publish-error"]')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/failed|error/i);

      // Should offer retry option
      await expect(page.locator('[data-testid="retry-publish-button"]')).toBeVisible();

      // Should not leave video in broken state
      await expect(page.locator('[data-testid="video-status"]')).not.toContainText('publishing');
    });
  });
});
