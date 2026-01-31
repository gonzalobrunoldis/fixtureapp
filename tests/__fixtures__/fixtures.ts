import type { FixtureDisplay } from '@/types/fixtures.types';

/**
 * Test fixture data for Home/Today Screen tests
 */

export const mockUpcomingFixture: FixtureDisplay = {
  id: 1001,
  homeTeam: {
    id: 100,
    name: 'Manchester United',
    logo: 'https://example.com/mufc.png',
    isWinner: null,
  },
  awayTeam: {
    id: 101,
    name: 'Liverpool',
    logo: 'https://example.com/lfc.png',
    isWinner: null,
  },
  status: 'NS',
  statusLong: 'Not Started',
  elapsed: null,
  startTime: new Date('2026-01-31T15:00:00Z'),
  score: {
    home: null,
    away: null,
  },
  league: {
    id: 39,
    name: 'Premier League',
    logo: 'https://example.com/pl.png',
    country: 'England',
  },
  venue: {
    name: 'Old Trafford',
    city: 'Manchester',
  },
  referee: 'Michael Oliver',
};

export const mockLiveFixture: FixtureDisplay = {
  id: 1002,
  homeTeam: {
    id: 102,
    name: 'Real Madrid',
    logo: 'https://example.com/real.png',
    isWinner: null,
  },
  awayTeam: {
    id: 103,
    name: 'Barcelona',
    logo: 'https://example.com/barca.png',
    isWinner: null,
  },
  status: '2H',
  statusLong: 'Second Half',
  elapsed: 67,
  startTime: new Date('2026-01-31T13:00:00Z'),
  score: {
    home: 2,
    away: 1,
    halftime: {
      home: 1,
      away: 1,
    },
  },
  league: {
    id: 140,
    name: 'La Liga',
    logo: 'https://example.com/laliga.png',
    country: 'Spain',
  },
  venue: {
    name: 'Santiago Bernabéu',
    city: 'Madrid',
  },
  referee: 'Antonio Mateu Lahoz',
  events: [
    {
      type: 'goal',
      time: 23,
      team: 'home',
      player: 'Vinícius Jr',
      assist: 'Bellingham',
    },
    {
      type: 'goal',
      time: 38,
      team: 'away',
      player: 'Lewandowski',
      detail: 'penalty',
    },
    {
      type: 'goal',
      time: 55,
      team: 'home',
      player: 'Bellingham',
    },
  ],
};

export const mockFinishedFixture: FixtureDisplay = {
  id: 1003,
  homeTeam: {
    id: 104,
    name: 'Bayern Munich',
    logo: 'https://example.com/bayern.png',
    isWinner: true,
  },
  awayTeam: {
    id: 105,
    name: 'Dortmund',
    logo: 'https://example.com/bvb.png',
    isWinner: false,
  },
  status: 'FT',
  statusLong: 'Match Finished',
  elapsed: 90,
  startTime: new Date('2026-01-31T10:00:00Z'),
  score: {
    home: 3,
    away: 1,
    halftime: {
      home: 1,
      away: 0,
    },
    fulltime: {
      home: 3,
      away: 1,
    },
  },
  league: {
    id: 78,
    name: 'Bundesliga',
    logo: 'https://example.com/bundesliga.png',
    country: 'Germany',
  },
  venue: {
    name: 'Allianz Arena',
    city: 'Munich',
  },
  referee: 'Felix Zwayer',
  events: [
    {
      type: 'goal',
      time: 12,
      team: 'home',
      player: 'Kane',
    },
    {
      type: 'goal',
      time: 54,
      team: 'home',
      player: 'Musiala',
    },
    {
      type: 'goal',
      time: 62,
      team: 'away',
      player: 'Adeyemi',
    },
    {
      type: 'goal',
      time: 78,
      team: 'home',
      player: 'Sané',
    },
    {
      type: 'card',
      time: 85,
      team: 'away',
      player: 'Hummels',
      detail: 'yellow',
    },
  ],
};

export const mockHalftimeFixture: FixtureDisplay = {
  id: 1004,
  homeTeam: {
    id: 106,
    name: 'PSG',
    logo: 'https://example.com/psg.png',
    isWinner: null,
  },
  awayTeam: {
    id: 107,
    name: 'Marseille',
    logo: 'https://example.com/om.png',
    isWinner: null,
  },
  status: 'HT',
  statusLong: 'Half Time',
  elapsed: 45,
  startTime: new Date('2026-01-31T14:00:00Z'),
  score: {
    home: 1,
    away: 0,
    halftime: {
      home: 1,
      away: 0,
    },
  },
  league: {
    id: 61,
    name: 'Ligue 1',
    logo: 'https://example.com/ligue1.png',
    country: 'France',
  },
};

export const mockCancelledFixture: FixtureDisplay = {
  id: 1005,
  homeTeam: {
    id: 108,
    name: 'Juventus',
    logo: 'https://example.com/juve.png',
    isWinner: null,
  },
  awayTeam: {
    id: 109,
    name: 'Inter Milan',
    logo: 'https://example.com/inter.png',
    isWinner: null,
  },
  status: 'CANC',
  statusLong: 'Match Cancelled',
  elapsed: null,
  startTime: new Date('2026-01-31T18:00:00Z'),
  score: {
    home: null,
    away: null,
  },
  league: {
    id: 135,
    name: 'Serie A',
    logo: 'https://example.com/seriea.png',
    country: 'Italy',
  },
};

// Multiple fixtures from same league for testing grouping
export const mockPremierLeagueFixtures: FixtureDisplay[] = [
  mockUpcomingFixture,
  {
    ...mockUpcomingFixture,
    id: 1006,
    homeTeam: {
      id: 110,
      name: 'Arsenal',
      logo: 'https://example.com/arsenal.png',
      isWinner: null,
    },
    awayTeam: {
      id: 111,
      name: 'Chelsea',
      logo: 'https://example.com/chelsea.png',
      isWinner: null,
    },
    startTime: new Date('2026-01-31T17:30:00Z'),
  },
];

// All fixtures for testing
export const mockAllFixtures: FixtureDisplay[] = [
  mockUpcomingFixture,
  mockLiveFixture,
  mockFinishedFixture,
  mockHalftimeFixture,
  mockCancelledFixture,
];
