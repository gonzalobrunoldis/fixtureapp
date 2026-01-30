/**
 * E2E Tests: Route Protection
 *
 * Tests middleware and AuthGuard protection for authenticated routes
 */

import { test, expect } from '@playwright/test';

const TEST_EMAIL = `route-test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Route Protection', () => {
  test.describe('Unauthenticated Users', () => {
    test('should redirect to login when accessing /home without auth', async ({
      page,
    }) => {
      await page.goto('/home');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing /competitions without auth', async ({
      page,
    }) => {
      await page.goto('/competitions/2');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing /groups without auth', async ({
      page,
    }) => {
      await page.goto('/groups/create');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing /following without auth', async ({
      page,
    }) => {
      await page.goto('/following');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing /settings without auth', async ({
      page,
    }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should allow access to /login when not authenticated', async ({
      page,
    }) => {
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should allow access to /signup when not authenticated', async ({
      page,
    }) => {
      await page.goto('/signup');
      await expect(page).toHaveURL(/\/signup/);
    });

    test('should preserve redirect URL after login', async ({ page }) => {
      // Try to access protected route
      await page.goto('/settings');

      // Should redirect to login with redirectTo parameter
      await expect(page).toHaveURL(/\/login/);
      const url = new URL(page.url());
      expect(url.searchParams.get('redirectTo')).toContain('/settings');

      // Login
      await page.fill('[name="email"]', TEST_EMAIL);
      await page.fill('[name="password"]', TEST_PASSWORD);
      await page.click('[type="submit"]');

      // Should redirect back to originally requested page
      await expect(page).toHaveURL(/\/settings/);
    });
  });

  test.describe('Authenticated Users', () => {
    test.beforeEach(async ({ page }) => {
      // Create test user if doesn't exist and login
      await page.goto('/signup');
      await page.fill('[name="email"]', TEST_EMAIL);
      await page.fill('[name="password"]', TEST_PASSWORD);
      await page.fill('[name="displayName"]', 'Route Test User');
      await page.click('[type="submit"]');

      // Wait for redirect
      await page.waitForURL(/\/(home|login)/, { timeout: 10000 });

      // If on login page, login
      if (page.url().includes('/login')) {
        await page.fill('[name="email"]', TEST_EMAIL);
        await page.fill('[name="password"]', TEST_PASSWORD);
        await page.click('[type="submit"]');
        await page.waitForURL(/\/home/);
      }
    });

    test('should allow access to /home when authenticated', async ({
      page,
    }) => {
      await page.goto('/home');
      await expect(page).toHaveURL(/\/home/);
    });

    test('should allow access to /competitions when authenticated', async ({
      page,
    }) => {
      await page.goto('/competitions/2');
      await expect(page).toHaveURL(/\/competitions\/2/);
    });

    test('should allow access to /groups when authenticated', async ({
      page,
    }) => {
      await page.goto('/groups/create');
      await expect(page).toHaveURL(/\/groups\/create/);
    });

    test('should allow access to /following when authenticated', async ({
      page,
    }) => {
      await page.goto('/following');
      await expect(page).toHaveURL(/\/following/);
    });

    test('should allow access to /settings when authenticated', async ({
      page,
    }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/settings/);
    });

    test('should redirect to /home when accessing /login while authenticated', async ({
      page,
    }) => {
      await page.goto('/login');
      await expect(page).toHaveURL(/\/home/);
    });

    test('should redirect to /home when accessing /signup while authenticated', async ({
      page,
    }) => {
      await page.goto('/signup');
      await expect(page).toHaveURL(/\/home/);
    });
  });
});

test.describe('API Route Protection', () => {
  test('should return 401 for protected API routes without auth', async ({
    request,
  }) => {
    // Test protected API endpoints
    const endpoints = ['/api/predictions', '/api/groups', '/api/profile'];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(401);
    }
  });

  test('should allow access to protected API routes with valid session', async ({
    page,
    request,
  }) => {
    // Login first to get session cookies
    await page.goto('/login');
    await page.fill('[name="email"]', TEST_EMAIL);
    await page.fill('[name="password"]', TEST_PASSWORD);
    await page.click('[type="submit"]');
    await page.waitForURL(/\/home/);

    // Get cookies from page context
    const cookies = await page.context().cookies();

    // Make API request with session cookies
    const response = await request.get('/api/profile', {
      headers: {
        Cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
      },
    });

    // Should not return 401
    expect(response.status()).not.toBe(401);
  });
});

test.describe('AuthGuard Component', () => {
  test('should show loading state while checking authentication', async ({
    page,
  }) => {
    await page.goto('/home');

    // Should briefly show loading state
    const loadingIndicator = page.locator('text=Loading...');
    const isLoading = await loadingIndicator.isVisible().catch(() => false);

    // Either shows loading or redirects immediately (both are valid)
    expect(isLoading || page.url().includes('/login')).toBe(true);
  });

  test('should use custom fallback when provided', async ({ page }) => {
    // This test requires a page with custom fallback
    // Implementation depends on which pages use AuthGuard with custom fallback
    // Placeholder for future implementation
  });
});
