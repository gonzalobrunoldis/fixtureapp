/**
 * E2E Tests: Complete Authentication Journey
 *
 * Tests complete user workflows from signup to logout
 * Uses Playwright for browser automation
 */

import { test, expect } from '@playwright/test';

// Test data
const TEST_EMAIL = `e2e-test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_DISPLAY_NAME = 'E2E Test User';

test.describe('Complete Authentication Journey', () => {
  test('should complete full signup, login, profile update, and logout flow', async ({
    page,
  }) => {
    // Step 1: Navigate to signup page
    await page.goto('/signup');
    await expect(page).toHaveURL(/\/signup/);

    // Step 2: Fill out signup form
    await page.fill('[name="email"]', TEST_EMAIL);
    await page.fill('[name="password"]', TEST_PASSWORD);
    await page.fill('[name="displayName"]', TEST_DISPLAY_NAME);

    // Step 3: Submit signup form
    await page.click('[type="submit"]');

    // Step 4: Verify redirect or success message
    // (Depending on email confirmation settings, user might be redirected to home or confirmation page)
    await page.waitForURL(/\/(home|login|auth)/, { timeout: 10000 });

    // If email confirmation is required, user will see a message
    const confirmationMessage = page.locator('text=check your email');
    const isConfirmationRequired = await confirmationMessage
      .isVisible()
      .catch(() => false);

    if (isConfirmationRequired) {
      // Navigate to login page
      await page.goto('/login');
    }

    // Step 5: Login with the new account (if not already logged in)
    const currentUrl = page.url();
    if (!currentUrl.includes('/home')) {
      await page.goto('/login');
      await page.fill('[name="email"]', TEST_EMAIL);
      await page.fill('[name="password"]', TEST_PASSWORD);
      await page.click('[type="submit"]');

      // Wait for redirect to home
      await page.waitForURL(/\/home/, { timeout: 10000 });
    }

    // Step 6: Verify we're on the home page
    await expect(page).toHaveURL(/\/home/);

    // Step 7: Navigate to settings/profile page
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/);

    // Step 8: Update profile
    const newDisplayName = 'Updated E2E User';
    await page.fill('[name="displayName"]', newDisplayName);
    await page.click('button:has-text("Save")');

    // Step 9: Verify profile update success
    await expect(page.locator('text=Profile updated successfully')).toBeVisible(
      {
        timeout: 5000,
      }
    );

    // Step 10: Logout
    await page.click('[data-testid="user-menu"]').catch(() => {
      // If user menu doesn't exist, try finding logout button directly
      return page.click('button:has-text("Log out")');
    });
    await page.click('button:has-text("Log out")');

    // Step 11: Verify redirect to login page
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation errors for invalid signup data', async ({
    page,
  }) => {
    await page.goto('/signup');

    // Test 1: Invalid email
    await page.fill('[name="email"]', 'invalid-email');
    await page.fill('[name="password"]', TEST_PASSWORD);
    await page.click('[type="submit"]');
    await expect(page.locator('text=valid email')).toBeVisible();

    // Test 2: Weak password
    await page.fill('[name="email"]', TEST_EMAIL);
    await page.fill('[name="password"]', '123');
    await page.click('[type="submit"]');
    await expect(page.locator('text=password')).toBeVisible();

    // Test 3: Empty fields
    await page.fill('[name="email"]', '');
    await page.fill('[name="password"]', '');
    await page.click('[type="submit"]');
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'nonexistent@example.com');
    await page.fill('[name="password"]', 'WrongPassword123!');
    await page.click('[type="submit"]');

    // Verify error message is displayed
    await expect(page.locator('text=Invalid')).toBeVisible();
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', TEST_EMAIL);
    await page.fill('[name="password"]', TEST_PASSWORD);
    await page.click('[type="submit"]');
    await page.waitForURL(/\/home/);

    // Refresh page
    await page.reload();

    // Verify still on home page (not redirected to login)
    await expect(page).toHaveURL(/\/home/);
  });

  test('should handle session expiry gracefully', async ({ page, context }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', TEST_EMAIL);
    await page.fill('[name="password"]', TEST_PASSWORD);
    await page.click('[type="submit"]');
    await page.waitForURL(/\/home/);

    // Clear session cookies to simulate expiry
    await context.clearCookies();

    // Try to access protected route
    await page.goto('/settings');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Password Reset Flow', () => {
  test('should request password reset successfully', async ({ page }) => {
    await page.goto('/login');

    // Click "Forgot password" link
    await page.click('text=Forgot password');

    // Should navigate to password reset page
    await expect(page).toHaveURL(/\/auth\/reset-password/);

    // Enter email
    await page.fill('[name="email"]', TEST_EMAIL);
    await page.click('[type="submit"]');

    // Verify success message
    await expect(page.locator('text=password reset email')).toBeVisible();
  });
});

test.describe('Social Authentication', () => {
  test.skip('should allow login with Google OAuth', async ({ page }) => {
    // Skip for now - requires Google OAuth setup
    // This is a placeholder for future implementation
    await page.goto('/login');
    await page.click('button:has-text("Continue with Google")');
    // ... OAuth flow
  });

  test.skip('should allow login with GitHub OAuth', async ({ page }) => {
    // Skip for now - requires GitHub OAuth setup
    // This is a placeholder for future implementation
    await page.goto('/login');
    await page.click('button:has-text("Continue with GitHub")');
    // ... OAuth flow
  });
});
