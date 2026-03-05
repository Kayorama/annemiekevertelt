import { test, expect } from '@playwright/test';

test.describe('Error Scenarios', () => {

  test.describe('Authentication Errors', () => {
    test('show error for invalid credentials', async ({ page }) => {
      await page.goto('/sign-in');

      await page.fill('[data-testid="email-input"]', 'wrong@email.com');
      await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
      await page.click('[data-testid="sign-in-button"]');

      await expect(page.locator('[data-testid="auth-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/invalid|incorrect/i);
    });

    test('show error for unverified email', async ({ page }) => {
      await page.goto('/sign-in');

      await page.fill('[data-testid="email-input"]', 'unverified@renderowl.test');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="sign-in-button"]');

      await expect(page.locator('[data-testid="email-verification-required"]')).toBeVisible();
      await expect(page.locator('[data-testid="resend-verification-button"]')).toBeVisible();
    });
  });

  test.describe('Credit Errors', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as user with low credits
      await page.goto('/sign-in');
      await page.fill('[data-testid="email-input"]', 'lowcredits@renderowl.test');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="sign-in-button"]');
      await page.waitForURL('/dashboard');
    });

    test('block render when insufficient credits', async ({ page }) => {
      await test.step('Create project with high credit cost', async () => {
        await page.click('[data-testid="new-project-button"]');
        await page.fill('[data-testid="project-name-input"]', 'Expensive Project');

        // Set 4K quality which costs more credits
        await page.selectOption('[data-testid="quality-select"]', '4k');
        await page.fill('[data-testid="duration-input"]', '600'); // 10 minutes

        await page.click('[data-testid="create-project-button"]');
      });

      await test.step('Attempt to render', async () => {
        await page.click('[data-testid="export-button"]');
        await page.click('[data-testid="start-render-button"]');
      });

      await test.step('Verify insufficient credits error', async () => {
        await expect(page.locator('[data-testid="insufficient-credits-modal"]')).toBeVisible();
        await expect(page.locator('[data-testid="credits-needed"]')).toBeVisible();
        await expect(page.locator('[data-testid="credits-available"]')).toBeVisible();

        // Should offer purchase option
        await expect(page.locator('[data-testid="buy-credits-button"]')).toBeVisible();
      });
    });

    test('show credit warning in editor', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="new-project-button"]');
      await page.fill('[data-testid="project-name-input"]', 'Test Project');
      await page.click('[data-testid="create-project-button"]');

      // Should show credit warning banner for low balance
      await expect(page.locator('[data-testid="low-credits-warning"]')).toBeVisible();
    });
  });

  test.describe('Render Errors', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/sign-in');
      await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="sign-in-button"]');
      await page.waitForURL('/dashboard');
    });

    test('handle render timeout gracefully', async ({ page }) => {
      test.setTimeout(300000);

      await test.step('Start render that will timeout', async () => {
        await page.goto('/dashboard');
        await page.click('[data-testid="video-card-timeout"]');
        await page.click('[data-testid="export-button"]');
        await page.click('[data-testid="start-render-button"]');
      });

      await test.step('Wait for timeout error', async () => {
        await expect(page.locator('[data-testid="render-error"]')).toBeVisible({ timeout: 120000 });
        await expect(page.locator('[data-testid="error-message"]')).toContainText(/timeout|took too long/i);
      });

      await test.step('Verify recovery options', async () => {
        // Should offer retry
        await expect(page.locator('[data-testid="retry-render-button"]')).toBeVisible();

        // Should offer lower quality option
        await expect(page.locator('[data-testid="try-lower-quality-button"]')).toBeVisible();

        // Credits should be refunded or not deducted
        await expect(page.locator('[data-testid="credits-refunded-notice"]')).toBeVisible();
      });
    });

    test('handle render failure due to invalid media', async ({ page }) => {
      await test.step('Upload corrupt media file', async () => {
        await page.click('[data-testid="new-project-button"]');
        await page.fill('[data-testid="project-name-input"]', 'Bad Media Test');
        await page.click('[data-testid="create-project-button"]');

        // Upload corrupt video
        await page.click('[data-testid="add-media-button"]');
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles('e2e/fixtures/corrupt-video.mp4');
      });

      await test.step('Verify error handling', async () => {
        await expect(page.locator('[data-testid="media-error"]')).toBeVisible();
        await expect(page.locator('[data-testid="error-message"]')).toContainText(/invalid|corrupt|unsupported/i);

        // Should prevent render with invalid media
        await page.click('[data-testid="export-button"]');
        await expect(page.locator('[data-testid="validation-errors"]')).toContainText(/fix errors before rendering/i);
      });
    });

    test('handle storage quota exceeded', async ({ page }) => {
      await test.step('Attempt upload with full storage', async () => {
        // Mock storage full scenario
        await page.goto('/dashboard?storage=full');
        await page.click('[data-testid="new-project-button"]');
        await page.fill('[data-testid="project-name-input"]', 'Storage Test');
        await page.click('[data-testid="create-project-button"]');

        await page.click('[data-testid="add-media-button"]');
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles('e2e/fixtures/test-video-1.mp4');
      });

      await test.step('Verify storage error', async () => {
        await expect(page.locator('[data-testid="storage-quota-error"]')).toBeVisible();
        await expect(page.locator('[data-testid="storage-usage-bar"]')).toHaveClass(/full/);

        // Should offer upgrade or cleanup
        await expect(page.locator('[data-testid="upgrade-storage-button"]')).toBeVisible();
        await expect(page.locator('[data-testid="manage-storage-button"]')).toBeVisible();
      });
    });
  });

  test.describe('Network Errors', () => {
    test('handle offline state', async ({ page }) => {
      await page.goto('/sign-in');

      // Simulate going offline
      await page.context().setOffline(true);

      // Try to sign in
      await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="sign-in-button"]');

      // Should show offline error
      await expect(page.locator('[data-testid="offline-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-connection-button"]')).toBeVisible();

      // Restore connection
      await page.context().setOffline(false);

      // Should be able to retry
      await page.click('[data-testid="retry-connection-button"]');
      await page.waitForURL('/dashboard');
    });

    test('handle API rate limiting', async ({ page }) => {
      await page.goto('/sign-in');
      await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="sign-in-button"]');
      await page.waitForURL('/dashboard');

      // Rapidly click to trigger rate limit
      for (let i = 0; i < 20; i++) {
        await page.click('[data-testid="refresh-button"]').catch(() => {});
      }

      // Should show rate limit error
      await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-after"]')).toBeVisible();
    });
  });

  test.describe('Validation Errors', () => {
    test('prevent project creation without name', async ({ page }) => {
      await page.goto('/sign-in');
      await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="sign-in-button"]');
      await page.waitForURL('/dashboard');

      await page.click('[data-testid="new-project-button"]');

      // Try to create without name
      await page.click('[data-testid="create-project-button"]');

      // Should show validation error
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-error"]')).toContainText(/required/i);
    });

    test('prevent YouTube publish without title', async ({ page }) => {
      await page.goto('/sign-in');
      await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="sign-in-button"]');
      await page.waitForURL('/dashboard');

      await page.click('[data-testid="video-card"]').first();
      await page.click('[data-testid="publish-button"]');
      await page.click('[data-testid="publish-youtube-option"]');

      // Try to publish without title
      await page.click('[data-testid="confirm-publish-button"]');

      await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="title-error"]')).toContainText(/required/i);
    });

    test('handle file upload size limit', async ({ page }) => {
      await page.goto('/sign-in');
      await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="sign-in-button"]');
      await page.waitForURL('/dashboard');

      await page.click('[data-testid="new-project-button"]');
      await page.fill('[data-testid="project-name-input"]', 'Large File Test');
      await page.click('[data-testid="create-project-button"]');

      // Try to upload oversized file
      await page.click('[data-testid="add-media-button"]');
      const fileInput = page.locator('input[type="file"]');

      // Mock a large file selection
      await fileInput.evaluate((el) => {
        const mockFile = new File(['x'], 'large-video.mp4', { type: 'video/mp4' });
        Object.defineProperty(mockFile, 'size', { value: 2 * 1024 * 1024 * 1024 }); // 2GB

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        (el as HTMLInputElement).files = dataTransfer.files;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });

      await expect(page.locator('[data-testid="file-size-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="max-file-size-info"]')).toContainText(/2 GB|limit/i);
    });
  });

  test.describe('Recovery Scenarios', () => {
    test('recover from crashed render job', async ({ page }) => {
      await page.goto('/sign-in');
      await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="sign-in-button"]');
      await page.waitForURL('/dashboard');

      // Mock a crashed render
      await page.goto('/renders?has-crashed-job=true');

      await test.step('Identify crashed job', async () => {
        await expect(page.locator('[data-testid="crashed-render"]')).toBeVisible();
        await expect(page.locator('[data-testid="job-status"]')).toContainText('failed');
      });

      await test.step('Retry crashed job', async () => {
        await page.click('[data-testid="retry-render-button"]');

        await expect(page.locator('[data-testid="render-restarted"]')).toBeVisible();
        await expect(page.locator('[data-testid="job-status"]')).toContainText('rendering');
      });
    });

    test('auto-save recovery after browser crash', async ({ page }) => {
      await page.goto('/sign-in');
      await page.fill('[data-testid="email-input"]', 'test@renderowl.test');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="sign-in-button"]');
      await page.waitForURL('/dashboard');

      await test.step('Create unsaved changes', async () => {
        await page.click('[data-testid="new-project-button"]');
        await page.fill('[data-testid="project-name-input"]', 'Auto-save Test');
        await page.click('[data-testid="create-project-button"]');

        // Make some edits
        await page.click('[data-testid="add-text-button"]');
        await page.fill('[data-testid="text-content-input"]', 'Test text that should be auto-saved');
      });

      await test.step('Simulate crash by navigating away', async () => {
        await page.goto('/dashboard');
      });

      await test.step('Verify recovery prompt', async () => {
        await expect(page.locator('[data-testid="unsaved-changes-prompt"]')).toBeVisible();
        await expect(page.locator('[data-testid="recover-project-button"]')).toBeVisible();
      });

      await test.step('Recover project', async () => {
        await page.click('[data-testid="recover-project-button"]');

        // Should restore previous state
        await expect(page.locator('[data-testid="canvas-text-overlay"]')).toContainText('Test text that should be auto-saved');
      });
    });
  });
});
