# Fixture App Tests

This directory contains all tests for the Fixture App.

## Directory Structure

```
tests/
├── unit/                      # Unit tests (isolated, fast)
│   ├── supabase-client.test.ts
│   ├── profile.service.test.ts
│   └── ...
├── integration/               # Integration tests (with real services)
│   ├── auth-flow.test.ts
│   ├── profile-management.test.ts
│   └── ...
├── e2e/                       # End-to-end tests (full user journeys)
│   ├── auth-journey.spec.ts
│   ├── route-protection.spec.ts
│   └── ...
├── __fixtures__/              # Test data fixtures
│   └── ...
├── setup.ts                   # Test setup and global configuration
├── DATABASE_AUTH_TESTS.md     # Database & Auth test documentation
└── README.md                  # This file
```

## Test Types

### Unit Tests

- **Framework:** Vitest
- **Purpose:** Test individual functions/components in isolation
- **Speed:** Fast (milliseconds)
- **Dependencies:** Mocked
- **When to run:** On every code change, before commits

### Integration Tests

- **Framework:** Vitest
- **Purpose:** Test interactions between components and services
- **Speed:** Medium (seconds)
- **Dependencies:** Real Supabase database (test project)
- **When to run:** Before merging PRs, in CI/CD pipeline

### E2E Tests

- **Framework:** Playwright
- **Purpose:** Test complete user workflows in a real browser
- **Speed:** Slow (seconds to minutes)
- **Dependencies:** Running dev server, real database
- **When to run:** Before releases, for critical flows

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all unit and integration tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with UI (interactive)
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Run Specific Tests

```bash
# Run specific test file
npm test auth-flow.test.ts

# Run tests matching a pattern
npm test -- --grep "Authentication"

# Run E2E test for specific feature
npx playwright test auth-journey.spec.ts
```

## Environment Setup

### For Unit Tests

No special setup required. Unit tests use mocks.

### For Integration Tests

1. Create a test Supabase project (separate from production)
2. Configure `.env.test` or `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_test_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_test_service_role_key
```

3. Enable RLS policies on test database
4. Run database migrations

### For E2E Tests

1. Same as integration tests setup
2. Ensure dev server is running: `npm run dev`
3. Install Playwright browsers: `npx playwright install`

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('MyFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Auth Integration', () => {
  it('should sign up user', async () => {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(error).toBeNull();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('[type="submit"]');
  await expect(page).toHaveURL(/\/home/);
});
```

## Test Naming Conventions

- **Test files:** `*.test.ts` (unit/integration), `*.spec.ts` (E2E)
- **Describe blocks:** Feature or component name
- **Test cases:** Start with "should" and describe expected behavior

## Best Practices

### General

1. **Write tests for every feature** - No exceptions
2. **Test behavior, not implementation** - Focus on what, not how
3. **Keep tests simple and focused** - One assertion per test when possible
4. **Use descriptive test names** - Should read like documentation
5. **Avoid test interdependencies** - Each test should run independently

### Unit Tests

1. **Mock external dependencies** - Database, API calls, etc.
2. **Test edge cases** - Empty inputs, null values, errors
3. **Keep tests fast** - Unit tests should run in milliseconds

### Integration Tests

1. **Use test database** - Never test against production
2. **Clean up after tests** - Delete test data created during tests
3. **Test realistic scenarios** - Use real data structures

### E2E Tests

1. **Test critical user paths** - Focus on important workflows
2. **Use stable selectors** - Prefer data-testid over text content
3. **Handle async operations** - Use proper waits, not fixed delays
4. **Keep E2E tests maintainable** - Extract common actions to helpers

## Continuous Integration

Tests run automatically on:

- Every pull request
- Every push to main branch
- Before deployments

### CI Configuration

See `.github/workflows/test.yml` for CI pipeline configuration.

## Test Coverage

View test coverage:

```bash
npm test -- --coverage
```

Coverage goals:

- **Overall:** 80% minimum
- **Critical paths:** 100% (auth, payments, predictions)
- **UI components:** 70% minimum

## Debugging Tests

### Unit/Integration Tests

```bash
# Run with verbose output
npm test -- --reporter=verbose

# Debug specific test
npm test -- --debug auth-flow.test.ts
```

### E2E Tests

```bash
# Run with headed browser (see what's happening)
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# Generate trace for failed tests
npx playwright test --trace on
```

## Common Issues

### "Module not found" errors

- Check `tsconfig.json` path aliases
- Verify imports use `@/` prefix
- Run `npm install` to ensure dependencies are installed

### Integration tests timing out

- Increase timeout in test config
- Check Supabase connection
- Verify test database is accessible

### E2E tests failing randomly

- Use proper waits instead of fixed timeouts
- Check for race conditions
- Ensure stable test data

### Supabase connection errors

- Verify environment variables are set
- Check network connectivity
- Ensure Supabase project is active

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)

## Maintenance

### Updating Tests

- Review and update tests when features change
- Remove tests for deleted features
- Add tests for new features immediately

### Test Data Cleanup

Periodically clean test database:

```sql
-- Delete test users (be careful!)
DELETE FROM auth.users WHERE email LIKE '%test%';
DELETE FROM profiles WHERE email LIKE '%test%';
```

## Getting Help

- Check this README first
- Review test documentation files (e.g., `DATABASE_AUTH_TESTS.md`)
- Check Linear tickets for context
- Ask team members
- Refer to CLAUDE.md for project guidelines
