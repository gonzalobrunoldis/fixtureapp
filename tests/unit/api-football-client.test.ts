/**
 * Unit Tests: API-Football Client
 *
 * Tests for the API-Football HTTP client authentication, error handling,
 * and rate limit tracking.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  apiFootballGet,
  ApiFootballError,
  checkApiStatus,
} from '@/lib/api-football/client';

// Mock environment variables
const MOCK_API_KEY = 'test-api-key-12345';

beforeEach(() => {
  // Set up environment variable
  process.env.API_FOOTBALL_KEY = MOCK_API_KEY;

  // Clear all mocks
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up
  delete process.env.API_FOOTBALL_KEY;
});

describe('API-Football Client - Authentication', () => {
  it('should include API key in request headers', async () => {
    // Mock fetch
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          get: '/test',
          parameters: {},
          errors: [],
          results: 1,
          paging: { current: 1, total: 1 },
          response: [{ test: 'data' }],
        }),
        {
          status: 200,
          headers: new Headers({
            'x-ratelimit-requests-limit': '100',
            'x-ratelimit-requests-remaining': '99',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '9',
          }),
        }
      )
    );

    await apiFootballGet('/test', {});

    // Verify fetch was called with correct headers
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Headers),
      })
    );

    const call = mockFetch.mock.calls[0];
    const headers = call[1]?.headers as Headers;
    expect(headers.get('x-rapidapi-key')).toBe(MOCK_API_KEY);
    expect(headers.get('x-rapidapi-host')).toBe('v3.football.api-sports.io');

    mockFetch.mockRestore();
  });

  it('should throw error if API key is not set', async () => {
    delete process.env.API_FOOTBALL_KEY;

    await expect(apiFootballGet('/test', {})).rejects.toThrow(
      'API_FOOTBALL_KEY environment variable is not set'
    );
  });
});

describe('API-Football Client - Error Handling', () => {
  it('should handle 429 rate limit errors', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('Too Many Requests', {
        status: 429,
        headers: new Headers({
          'x-ratelimit-requests-limit': '100',
          'x-ratelimit-requests-remaining': '0',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
        }),
      })
    );

    await expect(apiFootballGet('/test', {})).rejects.toThrow(ApiFootballError);

    try {
      await apiFootballGet('/test', {});
    } catch (error) {
      expect(error).toBeInstanceOf(ApiFootballError);
      expect((error as ApiFootballError).statusCode).toBe(429);
      expect((error as ApiFootballError).message).toContain(
        'Rate limit exceeded'
      );
    }

    mockFetch.mockRestore();
  });

  it('should handle HTTP errors (500)', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('Internal Server Error', {
        status: 500,
        headers: new Headers(),
      })
    );

    await expect(apiFootballGet('/test', {})).rejects.toThrow(ApiFootballError);

    mockFetch.mockRestore();
  });

  it('should handle API-level errors in response', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          get: '/test',
          parameters: {},
          errors: ['Invalid parameter: league'],
          results: 0,
          paging: { current: 1, total: 0 },
          response: [],
        }),
        {
          status: 200,
          headers: new Headers(),
        }
      )
    );

    await expect(apiFootballGet('/test', {})).rejects.toThrow(ApiFootballError);

    try {
      await apiFootballGet('/test', {});
    } catch (error) {
      expect(error).toBeInstanceOf(ApiFootballError);
      expect((error as ApiFootballError).errors).toContain(
        'Invalid parameter: league'
      );
    }

    mockFetch.mockRestore();
  });

  it('should handle network errors', async () => {
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Network error'));

    await expect(apiFootballGet('/test', {})).rejects.toThrow(ApiFootballError);

    mockFetch.mockRestore();
  });
});

describe('API-Football Client - Rate Limit Tracking', () => {
  it('should extract rate limit information from response headers', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          get: '/test',
          parameters: {},
          errors: [],
          results: 1,
          paging: { current: 1, total: 1 },
          response: [{ test: 'data' }],
        }),
        {
          status: 200,
          headers: new Headers({
            'x-ratelimit-requests-limit': '100',
            'x-ratelimit-requests-remaining': '50',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '5',
          }),
        }
      )
    );

    const response = await apiFootballGet('/test', {});

    expect(response).toBeDefined();
    expect(response.results).toBe(1);

    mockFetch.mockRestore();
  });
});

describe('API-Football Client - API Status Check', () => {
  it('should check API status successfully', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          get: '/status',
          parameters: {},
          errors: [],
          results: 1,
          paging: { current: 1, total: 1 },
          response: [{ status: 'ok' }],
        }),
        {
          status: 200,
          headers: new Headers({
            'x-ratelimit-requests-limit': '100',
            'x-ratelimit-requests-remaining': '99',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '9',
          }),
        }
      )
    );

    const status = await checkApiStatus();

    expect(status.available).toBe(true);
    expect(status.rateLimit).toBeDefined();

    mockFetch.mockRestore();
  });

  it('should handle API unavailability', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockRejectedValueOnce(
      new ApiFootballError('API unavailable', 503, [], {
        requestsLimit: 100,
        requestsRemaining: 0,
        perMinuteLimit: 10,
        perMinuteRemaining: 0,
      })
    );

    const status = await checkApiStatus();

    expect(status.available).toBe(false);

    mockFetch.mockRestore();
  });
});
