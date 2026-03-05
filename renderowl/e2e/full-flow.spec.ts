import { test, expect } from '@playwright/test';

test.describe('Full User Flow: Sign up → Create timeline → Add clips → Render → Download', () => {

  test('complete video creation and download flow', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes for full flow including render

    // ===== STEP 1: Sign Up =====
    await test.step('Sign up new user', async () => {
      await page.goto('/sign-up');

      // Verify sign up page loaded
      await expect(page.locator('h1')).toContainText('Create your account');

      // Fill sign up form
      await page.fill('[data-testid="email-input"]', `test-${Date.now()}@renderowl.test`);
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!');

      // Submit form
      await page.click('[data-testid="sign-up-button"]');

      // Wait for email verification or dashboard
      await page.waitForURL(/\/(dashboard|verify-email)/, { timeout: 30000 });

      // If verification required, mock it for E2E
      const currentUrl = page.url();
      if (currentUrl.includes('verify-email')) {
        // In test env, auto-verify
        await page.goto('/dashboard');
      }

      // Verify dashboard loaded
      await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible();
    });

    // ===== STEP 2: Create Timeline =====
    await test.step('Create new timeline/project', async () => {
      await page.click('[data-testid="new-project-button"]');

      // Fill project details
      await page.fill('[data-testid="project-name-input"]', 'E2E Test Video');
      await page.fill('[data-testid="project-description-input"]', 'Automated test video creation');

      // Select aspect ratio
      await page.selectOption('[data-testid="aspect-ratio-select"]', '16:9');

      // Set duration
      await page.fill('[data-testid="duration-input"]', '30');

      // Create project
      await page.click('[data-testid="create-project-button"]');

      // Wait for editor to load
      await page.waitForURL(/\/editor\/.+/, { timeout: 30000 });
      await expect(page.locator('[data-testid="timeline-editor"]')).toBeVisible();
    });

    // ===== STEP 3: Add Clips to Timeline =====
    await test.step('Add video clips to timeline', async () => {
      // Add first clip
      await page.click('[data-testid="add-media-button"]');
      await page.click('[data-testid="upload-video-option"]');

      // Upload test video file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('e2e/fixtures/test-video-1.mp4');

      // Wait for upload and processing
      await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="upload-complete"]')).toBeVisible({ timeout: 60000 });

      // Drag clip to timeline
      const clip = page.locator('[data-testid="media-clip"]').first();
      const timelineTrack = page.locator('[data-testid="timeline-track"]').first();

      await clip.dragTo(timelineTrack);

      // Verify clip appears on timeline
      await expect(page.locator('[data-testid="timeline-clip"]')).toHaveCount(1);

      // Add second clip
      await page.click('[data-testid="add-media-button"]');
      await page.click('[data-testid="stock-media-option"]');

      // Select stock video
      await page.click('[data-testid="stock-video-item"]').first();
      await page.click('[data-testid="add-to-timeline-button"]');

      // Verify two clips on timeline
      await expect(page.locator('[data-testid="timeline-clip"]')).toHaveCount(2);
    });

    // ===== STEP 4: Edit Timeline =====
    await test.step('Edit timeline (trim, arrange)', async () => {
      // Trim first clip
      const firstClip = page.locator('[data-testid="timeline-clip"]').first();
      await firstClip.click();

      // Open trim controls
      await page.click('[data-testid="trim-clip-button"]');

      // Adjust trim handles
      const trimHandle = page.locator('[data-testid="trim-handle-end"]');
      await trimHandle.dragTo(page.locator('[data-testid="timeline-track"]'), {
        targetPosition: { x: 200, y: 0 }
      });

      // Apply trim
      await page.click('[data-testid="apply-trim-button"]');

      // Reorder clips - drag second clip before first
      const clips = page.locator('[data-testid="timeline-clip"]');
      await clips.nth(1).dragTo(clips.nth(0));

      // Verify reorder
      await expect(page.locator('[data-testid="timeline-clip"]').first()).toHaveAttribute('data-clip-index', '1');
    });

    // ===== STEP 5: Add Effects/Transitions =====
    await test.step('Add transitions and effects', async () => {
      // Add transition between clips
      await page.click('[data-testid="add-transition-button"]');
      await page.click('[data-testid="transition-fade"]');

      // Set transition duration
      await page.fill('[data-testid="transition-duration-input"]', '1.5');

      // Add text overlay
      await page.click('[data-testid="add-text-button"]');
      await page.fill('[data-testid="text-content-input"]', 'E2E Test Video');
      await page.click('[data-testid="apply-text-button"]');

      // Verify text appears on canvas
      await expect(page.locator('[data-testid="canvas-text-overlay"]')).toContainText('E2E Test Video');
    });

    // ===== STEP 6: Preview =====
    await test.step('Preview video', async () => {
      await page.click('[data-testid="preview-button"]');

      // Wait for preview to load
      await expect(page.locator('[data-testid="preview-player"]')).toBeVisible();

      // Play preview
      await page.click('[data-testid="play-button"]');

      // Wait a moment for playback
      await page.waitForTimeout(2000);

      // Verify player is playing
      await expect(page.locator('[data-testid="player-playing"]')).toBeVisible();

      // Close preview
      await page.click('[data-testid="close-preview-button"]');
    });

    // ===== STEP 7: Render =====
    await test.step('Start render process', async () => {
      await page.click('[data-testid="export-button"]');

      // Select quality
      await page.selectOption('[data-testid="quality-select"]', '1080p');

      // Choose format
      await page.selectOption('[data-testid="format-select"]', 'mp4');

      // Start render
      await page.click('[data-testid="start-render-button"]');

      // Verify render started
      await expect(page.locator('[data-testid="render-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="render-status"]')).toContainText('Rendering');
    });

    // ===== STEP 8: Wait for Render Completion =====
    await test.step('Wait for render to complete', async () => {
      // Poll for render completion (can take 1-3 minutes)
      const maxWaitTime = 180000; // 3 minutes
      const pollInterval = 5000; // 5 seconds

      const startTime = Date.now();
      let isComplete = false;

      while (!isComplete && (Date.now() - startTime) < maxWaitTime) {
        await page.waitForTimeout(pollInterval);

        // Refresh to check status
        await page.reload();

        const status = await page.locator('[data-testid="render-status"]').textContent();
        if (status?.includes('Complete') || status?.includes('Ready')) {
          isComplete = true;
        } else if (status?.includes('Failed') || status?.includes('Error')) {
          throw new Error(`Render failed with status: ${status}`);
        }
      }

      if (!isComplete) {
        throw new Error('Render did not complete within expected time');
      }

      // Verify download button appears
      await expect(page.locator('[data-testid="download-button"]')).toBeVisible();
    });

    // ===== STEP 9: Download =====
    await test.step('Download rendered video', async () => {
      // Set up download listener
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="download-button"]')
      ]);

      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.(mp4|mov)$/);

      // Save to test downloads
      await download.saveAs(`test-downloads/${download.suggestedFilename()}`);

      // Verify file exists and has content
      const fs = require('fs');
      const path = `test-downloads/${download.suggestedFilename()}`;
      expect(fs.existsSync(path)).toBe(true);
      expect(fs.statSync(path).size).toBeGreaterThan(1000); // At least 1KB
    });
  });

  test('user can sign in with existing account', async ({ page }) => {
    await page.goto('/sign-in');

    await page.fill('[data-testid="email-input"]', 'existing@renderowl.test');
    await page.fill('[data-testid="password-input"]', 'ExistingPassword123!');
    await page.click('[data-testid="sign-in-button"]');

    await page.waitForURL('/dashboard', { timeout: 30000 });
    await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible();
  });
});
