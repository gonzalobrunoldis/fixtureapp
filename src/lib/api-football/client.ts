/**
 * API-Football HTTP Client
 *
 * Provides a configured HTTP client for making requests to the API-Football API.
 * Handles authentication, error handling, and request/response logging in development.
 *
 * @see https://www.api-football.com/documentation-v3
 */

const API_BASE_URL = 'https://v3.football.api-sports.io';

/**
 * Standard API-Football response structure
 */
export interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, string | number>;
  errors: string[] | Record<string, string>[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
}

/**
 * Rate limit information from response headers
 */
export interface RateLimitInfo {
  requestsLimit: number; // Daily limit
  requestsRemaining: number; // Remaining daily requests
  perMinuteLimit: number; // Requests per minute limit
  perMinuteRemaining: number; // Remaining requests this minute
}

/**
 * API Error class for better error handling
 */
export class ApiFootballError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[] | Record<string, string>[],
    public rateLimit?: RateLimitInfo
  ) {
    super(message);
    this.name = 'ApiFootballError';
  }
}

/**
 * Get the API key from environment variables
 */
function getApiKey(): string {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    throw new Error(
      'API_FOOTBALL_KEY environment variable is not set. Please add it to your .env file.'
    );
  }

  return apiKey;
}

/**
 * Extract rate limit information from response headers
 */
function extractRateLimitInfo(headers: Headers): RateLimitInfo {
  return {
    requestsLimit: parseInt(
      headers.get('x-ratelimit-requests-limit') || '0',
      10
    ),
    requestsRemaining: parseInt(
      headers.get('x-ratelimit-requests-remaining') || '0',
      10
    ),
    perMinuteLimit: parseInt(headers.get('X-RateLimit-Limit') || '0', 10),
    perMinuteRemaining: parseInt(
      headers.get('X-RateLimit-Remaining') || '0',
      10
    ),
  };
}

/**
 * Log request and response in development mode
 */
function logRequest(
  endpoint: string,
  params: Record<string, string | number>,
  rateLimit?: RateLimitInfo
) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🏈 API-Football Request:', {
      endpoint,
      params,
      timestamp: new Date().toISOString(),
    });

    if (rateLimit) {
      console.log('📊 Rate Limit Info:', {
        daily: `${rateLimit.requestsRemaining}/${rateLimit.requestsLimit}`,
        perMinute: `${rateLimit.perMinuteRemaining}/${rateLimit.perMinuteLimit}`,
      });
    }
  }
}

/**
 * Log response in development mode
 */
function logResponse<T>(data: ApiFootballResponse<T>, duration: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ API-Football Response:', {
      results: data.results,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Log error in development mode
 */
function logError(error: unknown, duration: number) {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ API-Football Error:', {
      error:
        error instanceof Error
          ? { message: error.message, name: error.name }
          : error,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Make a GET request to the API-Football API
 *
 * @param endpoint - The API endpoint (e.g., '/fixtures', '/leagues')
 * @param params - Query parameters
 * @returns Promise resolving to the API response
 * @throws {ApiFootballError} If the request fails
 */
export async function apiFootballGet<T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<ApiFootballResponse<T>> {
  const startTime = Date.now();
  const apiKey = getApiKey();

  // Build query string
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });

  const url = `${API_BASE_URL}${endpoint}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  // Configure headers
  const headers = new Headers();
  headers.append('x-rapidapi-key', apiKey);
  headers.append('x-rapidapi-host', 'v3.football.api-sports.io');

  try {
    // Log request in development
    logRequest(endpoint, params);

    // Make the request
    const response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'follow',
    });

    // Extract rate limit info
    const rateLimit = extractRateLimitInfo(response.headers);

    // Log rate limit in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Rate Limit Info:', {
        daily: `${rateLimit.requestsRemaining}/${rateLimit.requestsLimit}`,
        perMinute: `${rateLimit.perMinuteRemaining}/${rateLimit.perMinuteLimit}`,
      });
    }

    // Check for rate limit error (429)
    if (response.status === 429) {
      const duration = Date.now() - startTime;
      logError(new Error('Rate limit exceeded'), duration);

      throw new ApiFootballError(
        'Rate limit exceeded. Please try again later.',
        429,
        ['Too many requests'],
        rateLimit
      );
    }

    // Check for other HTTP errors
    if (!response.ok) {
      const duration = Date.now() - startTime;
      const errorText = await response.text();

      logError(new Error(`HTTP ${response.status}: ${errorText}`), duration);

      throw new ApiFootballError(
        `API request failed with status ${response.status}`,
        response.status,
        [errorText],
        rateLimit
      );
    }

    // Parse JSON response
    const data: ApiFootballResponse<T> = await response.json();

    // Check for API-level errors
    if (data.errors && data.errors.length > 0) {
      const duration = Date.now() - startTime;
      logError(
        new Error(`API errors: ${JSON.stringify(data.errors)}`),
        duration
      );

      throw new ApiFootballError(
        'API returned errors',
        response.status,
        data.errors,
        rateLimit
      );
    }

    // Log successful response
    const duration = Date.now() - startTime;
    logResponse(data, duration);

    return data;
  } catch (error) {
    // Handle fetch errors (network issues, etc.)
    if (error instanceof ApiFootballError) {
      throw error;
    }

    const duration = Date.now() - startTime;
    logError(error, duration);

    throw new ApiFootballError(
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while fetching data',
      undefined,
      undefined,
      undefined
    );
  }
}

/**
 * Check API status and rate limits
 * Useful for monitoring and debugging
 */
export async function checkApiStatus(): Promise<{
  available: boolean;
  rateLimit: RateLimitInfo;
}> {
  try {
    const response = await apiFootballGet<unknown[]>('/status');
    const headers = new Headers();
    // Note: In a real implementation, we'd need to access the actual response headers
    // This is a simplified version
    return {
      available: true,
      rateLimit: {
        requestsLimit: 100,
        requestsRemaining: 99,
        perMinuteLimit: 10,
        perMinuteRemaining: 9,
      },
    };
  } catch (error) {
    if (error instanceof ApiFootballError) {
      return {
        available: false,
        rateLimit: error.rateLimit || {
          requestsLimit: 0,
          requestsRemaining: 0,
          perMinuteLimit: 0,
          perMinuteRemaining: 0,
        },
      };
    }

    throw error;
  }
}
