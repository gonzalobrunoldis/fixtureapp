// @ts-nocheck
/**
 * Integration Tests: API Routes
 *
 * Tests for Next.js API routes including fixtures, standings, and teams endpoints.
 * Tests integration with API-Football client and caching layer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock modules before importing routes
vi.mock('@/lib/api-football/endpoints', () => ({
  getFixtures: vi.fn(),
  getFixtureById: vi.fn(),
  getStandings: vi.fn(),
  getTeams: vi.fn(),
  getTeamStatistics: vi.fn(),
}));
vi.mock('@/lib/api-football/cache', () => ({
  getCachedFixtures: vi.fn(),
  cacheFixtures: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));
vi.mock('@/lib/api-football/client', () => ({
  ApiFootballError: class ApiFootballError extends Error {
    constructor(
      message: string,
      public statusCode?: number,
      public errors?: any[]
    ) {
      super(message);
    }
  },
}));

describe('API Routes - Fixtures Endpoint', () => {
  it('should return fixtures from cache if available', async () => {
    const mockFixtures = [
      {
        fixture: { id: 12345, date: '2024-01-22T20:00:00+00:00' },
        teams: {
          home: { id: 100, name: 'Home Team' },
          away: { id: 200, name: 'Away Team' },
        },
        goals: { home: 2, away: 1 },
      },
    ];

    // @ts-expect-error - Mocked module
    const { getCachedFixtures } = await import('@/lib/api-football/cache');
    vi.mocked(getCachedFixtures).mockResolvedValue(mockFixtures as any);

    const { GET } = await import('@/app/api/fixtures/route');
    const request = new Request('http://localhost:3000/api/fixtures?league=2');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.source).toBe('cache');
    expect(data.data).toEqual(mockFixtures);
    expect(data.count).toBe(1);
  });

  it('should fetch from API if cache miss', async () => {
    const mockFixtures = [
      {
        fixture: { id: 12345, date: '2024-01-22T20:00:00+00:00' },
        teams: {
          home: { id: 100, name: 'Home Team' },
          away: { id: 200, name: 'Away Team' },
        },
        goals: { home: 2, away: 1 },
      },
    ];

    // @ts-expect-error - Mocked module
    const { getCachedFixtures, cacheFixtures } =
      await import('@/lib/api-football/cache');
    const { getFixtures } = await import('@/lib/api-football/endpoints');

    vi.mocked(getCachedFixtures).mockResolvedValue(null);
    vi.mocked(getFixtures).mockResolvedValue({
      response: mockFixtures,
      results: 1,
    } as any);
    vi.mocked(cacheFixtures).mockResolvedValue(undefined);

    const { GET } = await import('@/app/api/fixtures/route');
    const request = new Request(
      'http://localhost:3000/api/fixtures?league=2&season=2024'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.source).toBe('api');
    expect(data.data).toEqual(mockFixtures);
    expect(cacheFixtures).toHaveBeenCalledWith(mockFixtures);
  });

  it('should handle API errors correctly', async () => {
    // @ts-expect-error - Mocked module
    const { getCachedFixtures } = await import('@/lib/api-football/cache');
    const { getFixtures } = await import('@/lib/api-football/endpoints');
    const { ApiFootballError } = await import('@/lib/api-football/client');

    vi.mocked(getCachedFixtures).mockResolvedValue(null);
    vi.mocked(getFixtures).mockRejectedValue(
      new ApiFootballError('API Error', 500, ['Internal error'])
    );

    const { GET } = await import('@/app/api/fixtures/route');
    const request = new Request('http://localhost:3000/api/fixtures?league=2');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API Error');
  });
});

describe('API Routes - Standings Endpoint', () => {
  it('should return standings successfully', async () => {
    const mockStandings = [
      {
        league: {
          id: 2,
          name: 'UEFA Champions League',
          standings: [
            [
              {
                rank: 1,
                team: { id: 100, name: 'Team A' },
                points: 10,
              },
            ],
          ],
        },
      },
    ];

    const { getStandings } = await import('@/lib/api-football/endpoints');
    vi.mocked(getStandings).mockResolvedValue({
      response: mockStandings,
      results: 1,
    } as any);

    const { GET } = await import('@/app/api/standings/route');
    const request = new Request(
      'http://localhost:3000/api/standings?league=2&season=2024'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockStandings);
    expect(data.league).toBe(2);
    expect(data.season).toBe(2024);
  });

  it('should validate required parameters', async () => {
    const { GET } = await import('@/app/api/standings/route');
    const request = new Request('http://localhost:3000/api/standings');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required parameters');
  });

  it('should handle not found scenarios', async () => {
    const { getStandings } = await import('@/lib/api-football/endpoints');
    vi.mocked(getStandings).mockResolvedValue({
      response: [],
      results: 0,
    } as any);

    const { GET } = await import('@/app/api/standings/route');
    const request = new Request(
      'http://localhost:3000/api/standings?league=999&season=2024'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('No standings found');
  });
});

describe('API Routes - Teams Endpoint', () => {
  it('should return teams successfully', async () => {
    const mockTeams = [
      {
        team: { id: 100, name: 'Team A', logo: 'https://example.com/logo.png' },
        venue: { id: 1, name: 'Stadium A', city: 'City A' },
      },
    ];

    const { getTeams } = await import('@/lib/api-football/endpoints');
    vi.mocked(getTeams).mockResolvedValue({
      response: mockTeams,
      results: 1,
    } as any);

    const { GET } = await import('@/app/api/teams/route');
    const request = new Request('http://localhost:3000/api/teams?name=Team A');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockTeams);
    expect(data.count).toBe(1);
  });

  it('should include statistics when requested', async () => {
    const mockTeams = [
      {
        team: { id: 100, name: 'Team A' },
        venue: { id: 1, name: 'Stadium A' },
      },
    ];

    const mockStats = {
      team: { id: 100, name: 'Team A' },
      statistics: [{ type: 'goals', value: 50 }],
    };

    const { getTeams, getTeamStatistics } =
      await import('@/lib/api-football/endpoints');
    vi.mocked(getTeams).mockResolvedValue({
      response: mockTeams,
      results: 1,
    } as any);
    vi.mocked(getTeamStatistics).mockResolvedValue({
      response: mockStats,
      results: 1,
    } as any);

    const { GET } = await import('@/app/api/teams/route');
    const request = new Request(
      'http://localhost:3000/api/teams?id=100&league=2&season=2024&stats=true'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.statistics).toEqual(mockStats);
  });

  it('should validate stats parameters', async () => {
    const { GET } = await import('@/app/api/teams/route');
    const request = new Request(
      'http://localhost:3000/api/teams?id=100&stats=true'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid parameters');
  });
});

describe('API Routes - Dynamic Routes', () => {
  it('should handle fixture detail route', async () => {
    const mockFixture = {
      fixture: { id: 12345, date: '2024-01-22T20:00:00+00:00' },
      teams: {
        home: { id: 100, name: 'Home Team' },
        away: { id: 200, name: 'Away Team' },
      },
      goals: { home: 2, away: 1 },
    };

    // @ts-expect-error - Mocked module
    const { getCachedFixtures, cacheFixtures } =
      await import('@/lib/api-football/cache');
    const { getFixtureById } = await import('@/lib/api-football/endpoints');

    vi.mocked(getCachedFixtures).mockResolvedValue(null);
    vi.mocked(getFixtureById).mockResolvedValue({
      response: [mockFixture],
      results: 1,
    } as any);
    vi.mocked(cacheFixtures).mockResolvedValue(undefined);

    // @ts-expect-error - Dynamic route import
    const { GET } = await import('@/app/api/fixtures/[id]/route');
    const request = new Request('http://localhost:3000/api/fixtures/12345');
    const params = Promise.resolve({ id: '12345' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockFixture);
  });

  it('should handle invalid fixture ID', async () => {
    // @ts-expect-error - Dynamic route import
    const { GET } = await import('@/app/api/fixtures/[id]/route');
    const request = new Request('http://localhost:3000/api/fixtures/invalid');
    const params = Promise.resolve({ id: 'invalid' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid fixture ID');
  });

  it('should handle team detail route', async () => {
    const mockTeam = {
      team: { id: 100, name: 'Team A' },
      venue: { id: 1, name: 'Stadium A' },
    };

    const { getTeams } = await import('@/lib/api-football/endpoints');
    vi.mocked(getTeams).mockResolvedValue({
      response: [mockTeam],
      results: 1,
    } as any);

    // @ts-expect-error - Dynamic route import
    const { GET } = await import('@/app/api/teams/[id]/route');
    const request = new Request('http://localhost:3000/api/teams/100');
    const params = Promise.resolve({ id: '100' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockTeam);
  });
});
