/**
 * API-Football TypeScript Types and Zod Schemas
 *
 * Comprehensive type definitions and validation schemas for all API-Football responses.
 * Includes types for fixtures, teams, leagues, standings, events, lineups, and statistics.
 *
 * @see https://www.api-football.com/documentation-v3
 */

import { z } from 'zod';

// ============================================================================
// CORE API TYPES
// ============================================================================

/**
 * Standard API-Football response wrapper
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    get: z.string(),
    parameters: z.record(z.string(), z.union([z.string(), z.number()])),
    errors: z.union([
      z.array(z.string()),
      z.array(z.record(z.string(), z.string())),
    ]),
    results: z.number(),
    paging: z.object({
      current: z.number(),
      total: z.number(),
    }),
    response: dataSchema,
  });

export type ApiResponse<T> = {
  get: string;
  parameters: Record<string, string | number>;
  errors: string[] | Record<string, string>[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
};

// ============================================================================
// FIXTURE STATUS
// ============================================================================

/**
 * All possible fixture statuses
 */
export const FixtureStatusSchema = z.enum([
  'TBD', // Time to be defined
  'NS', // Not started
  '1H', // First half
  'HT', // Halftime
  '2H', // Second half
  'ET', // Extra time
  'BT', // Break time (before extra time)
  'P', // Penalty in progress
  'SUSP', // Match suspended
  'INT', // Match interrupted
  'FT', // Finished
  'AET', // Finished after extra time
  'PEN', // Finished after penalties
  'PST', // Postponed
  'CANC', // Cancelled
  'ABD', // Abandoned
  'AWD', // Technical loss
  'WO', // Walkover
]);

export type FixtureStatus = z.infer<typeof FixtureStatusSchema>;

/**
 * Helper to check if a fixture is live
 */
export function isFixtureLive(status: FixtureStatus): boolean {
  return ['1H', 'HT', '2H', 'ET', 'BT', 'P'].includes(status);
}

/**
 * Helper to check if a fixture is finished
 */
export function isFixtureFinished(status: FixtureStatus): boolean {
  return ['FT', 'AET', 'PEN', 'ABD', 'AWD', 'WO'].includes(status);
}

/**
 * Helper to check if a fixture is scheduled
 */
export function isFixtureScheduled(status: FixtureStatus): boolean {
  return ['TBD', 'NS'].includes(status);
}

// ============================================================================
// BASIC ENTITIES
// ============================================================================

/**
 * Country information
 */
export const CountrySchema = z.object({
  name: z.string(),
  code: z.string().nullable(),
  flag: z.string().url().nullable(),
});

export type Country = z.infer<typeof CountrySchema>;

/**
 * League/Competition information
 */
export const LeagueSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  logo: z.string().url(),
});

export type League = z.infer<typeof LeagueSchema>;

/**
 * Season information
 */
export const SeasonSchema = z.object({
  year: z.number(),
  start: z.string(),
  end: z.string(),
  current: z.boolean(),
  coverage: z
    .object({
      fixtures: z.object({
        events: z.boolean(),
        lineups: z.boolean(),
        statistics_fixtures: z.boolean(),
        statistics_players: z.boolean(),
      }),
      standings: z.boolean(),
      players: z.boolean(),
      top_scorers: z.boolean(),
      top_assists: z.boolean(),
      top_cards: z.boolean(),
      injuries: z.boolean(),
      predictions: z.boolean(),
      odds: z.boolean(),
    })
    .optional(),
});

export type Season = z.infer<typeof SeasonSchema>;

/**
 * Team information
 */
export const TeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().optional(),
  country: z.string().optional(),
  founded: z.number().optional(),
  national: z.boolean().optional(),
  logo: z.string().url(),
  winner: z.boolean().nullable().optional(),
});

export type Team = z.infer<typeof TeamSchema>;

/**
 * Venue information
 */
export const VenueSchema = z.object({
  id: z.number().nullable(),
  name: z.string().nullable(),
  address: z.string().optional(),
  city: z.string().nullable(),
  capacity: z.number().optional(),
  surface: z.string().optional(),
  image: z.string().url().optional(),
});

export type Venue = z.infer<typeof VenueSchema>;

/**
 * Goals (score) information
 */
export const GoalsSchema = z.object({
  home: z.number().nullable(),
  away: z.number().nullable(),
});

export type Goals = z.infer<typeof GoalsSchema>;

// ============================================================================
// FIXTURE TYPES
// ============================================================================

/**
 * Fixture core information
 */
export const FixtureSchema = z.object({
  id: z.number(),
  referee: z.string().nullable(),
  timezone: z.string(),
  date: z.string(),
  timestamp: z.number(),
  periods: z.object({
    first: z.number().nullable(),
    second: z.number().nullable(),
  }),
  venue: VenueSchema,
  status: z.object({
    long: z.string(),
    short: FixtureStatusSchema,
    elapsed: z.number().nullable(),
  }),
});

export type Fixture = z.infer<typeof FixtureSchema>;

/**
 * Score breakdown
 */
export const ScoreSchema = z.object({
  halftime: GoalsSchema,
  fulltime: GoalsSchema,
  extratime: GoalsSchema,
  penalty: GoalsSchema,
});

export type Score = z.infer<typeof ScoreSchema>;

/**
 * Match event (goal, card, substitution, VAR)
 */
export const EventSchema = z.object({
  time: z.object({
    elapsed: z.number(),
    extra: z.number().nullable(),
  }),
  team: TeamSchema,
  player: z.object({
    id: z.number().nullable(),
    name: z.string().nullable(),
  }),
  assist: z.object({
    id: z.number().nullable(),
    name: z.string().nullable(),
  }),
  type: z.enum(['Goal', 'Card', 'subst', 'Var']),
  detail: z.string(),
  comments: z.string().nullable(),
});

export type Event = z.infer<typeof EventSchema>;

/**
 * Player in lineup
 */
export const LineupPlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  number: z.number(),
  pos: z.string(),
  grid: z.string().nullable(),
});

export type LineupPlayer = z.infer<typeof LineupPlayerSchema>;

/**
 * Team colors
 */
export const TeamColorsSchema = z.object({
  player: z.object({
    primary: z.string(),
    number: z.string(),
    border: z.string(),
  }),
  goalkeeper: z.object({
    primary: z.string(),
    number: z.string(),
    border: z.string(),
  }),
});

export type TeamColors = z.infer<typeof TeamColorsSchema>;

/**
 * Team lineup
 */
export const LineupSchema = z.object({
  team: TeamSchema.extend({
    colors: TeamColorsSchema.optional(),
  }),
  formation: z.string(),
  startXI: z.array(
    z.object({
      player: LineupPlayerSchema,
    })
  ),
  substitutes: z.array(
    z.object({
      player: LineupPlayerSchema,
    })
  ),
  coach: z.object({
    id: z.number().nullable(),
    name: z.string().nullable(),
    photo: z.string().url().nullable(),
  }),
});

export type Lineup = z.infer<typeof LineupSchema>;

/**
 * Team statistics for a match
 */
export const TeamStatisticSchema = z.object({
  type: z.string(),
  value: z.union([z.number(), z.string()]).nullable(),
});

export type TeamStatistic = z.infer<typeof TeamStatisticSchema>;

export const MatchStatisticsSchema = z.object({
  team: TeamSchema,
  statistics: z.array(TeamStatisticSchema),
});

export type MatchStatistics = z.infer<typeof MatchStatisticsSchema>;

/**
 * Player statistics in a match
 */
export const PlayerGameStatsSchema = z.object({
  games: z.object({
    minutes: z.number().nullable(),
    number: z.number().nullable(),
    position: z.string().nullable(),
    rating: z.string().nullable(),
    captain: z.boolean(),
    substitute: z.boolean(),
  }),
  offsides: z.number().nullable(),
  shots: z.object({
    total: z.number().nullable(),
    on: z.number().nullable(),
  }),
  goals: z.object({
    total: z.number().nullable(),
    conceded: z.number().nullable(),
    assists: z.number().nullable(),
    saves: z.number().nullable(),
  }),
  passes: z.object({
    total: z.number().nullable(),
    key: z.number().nullable(),
    accuracy: z.string().nullable(),
  }),
  tackles: z.object({
    total: z.number().nullable(),
    blocks: z.number().nullable(),
    interceptions: z.number().nullable(),
  }),
  duels: z.object({
    total: z.number().nullable(),
    won: z.number().nullable(),
  }),
  dribbles: z.object({
    attempts: z.number().nullable(),
    success: z.number().nullable(),
    past: z.number().nullable(),
  }),
  fouls: z.object({
    drawn: z.number().nullable(),
    committed: z.number().nullable(),
  }),
  cards: z.object({
    yellow: z.number().nullable(),
    red: z.number().nullable(),
  }),
  penalty: z.object({
    won: z.number().nullable(),
    commited: z.number().nullable(),
    scored: z.number().nullable(),
    missed: z.number().nullable(),
    saved: z.number().nullable(),
  }),
});

export type PlayerGameStats = z.infer<typeof PlayerGameStatsSchema>;

export const PlayerStatsSchema = z.object({
  player: z.object({
    id: z.number(),
    name: z.string(),
    photo: z.string().url(),
  }),
  statistics: z.array(PlayerGameStatsSchema),
});

export type PlayerStats = z.infer<typeof PlayerStatsSchema>;

export const TeamPlayersStatsSchema = z.object({
  team: TeamSchema.extend({
    update: z.string().optional(),
  }),
  players: z.array(PlayerStatsSchema),
});

export type TeamPlayersStats = z.infer<typeof TeamPlayersStatsSchema>;

/**
 * Complete fixture response with all details
 */
export const FixtureResponseSchema = z.object({
  fixture: FixtureSchema,
  league: LeagueSchema.extend({
    country: z.string(),
    flag: z.string().url().nullable(),
    season: z.number(),
    round: z.string(),
  }),
  teams: z.object({
    home: TeamSchema,
    away: TeamSchema,
  }),
  goals: GoalsSchema,
  score: ScoreSchema,
  events: z.array(EventSchema).optional(),
  lineups: z.array(LineupSchema).optional(),
  statistics: z.array(MatchStatisticsSchema).optional(),
  players: z.array(TeamPlayersStatsSchema).optional(),
});

export type FixtureResponse = z.infer<typeof FixtureResponseSchema>;

// ============================================================================
// STANDINGS TYPES
// ============================================================================

/**
 * Team record (played, wins, draws, losses, goals)
 */
export const TeamRecordSchema = z.object({
  played: z.number(),
  win: z.number(),
  draw: z.number(),
  lose: z.number(),
  goals: z.object({
    for: z.number(),
    against: z.number(),
  }),
});

export type TeamRecord = z.infer<typeof TeamRecordSchema>;

/**
 * Single team's standing entry
 */
export const StandingEntrySchema = z.object({
  rank: z.number(),
  team: TeamSchema,
  points: z.number(),
  goalsDiff: z.number(),
  group: z.string(),
  form: z.string().nullable(),
  status: z.string().nullable(),
  description: z.string().nullable(),
  all: TeamRecordSchema,
  home: TeamRecordSchema,
  away: TeamRecordSchema,
  update: z.string(),
});

export type StandingEntry = z.infer<typeof StandingEntrySchema>;

/**
 * League standings response
 */
export const StandingsResponseSchema = z.object({
  league: z.object({
    id: z.number(),
    name: z.string(),
    country: z.string(),
    logo: z.string().url(),
    flag: z.string().url().nullable(),
    season: z.number(),
    standings: z.array(z.array(StandingEntrySchema)),
  }),
});

export type StandingsResponse = z.infer<typeof StandingsResponseSchema>;

// ============================================================================
// LEAGUE TYPES
// ============================================================================

/**
 * Complete league information response
 */
export const LeagueResponseSchema = z.object({
  league: LeagueSchema,
  country: CountrySchema,
  seasons: z.array(SeasonSchema),
});

export type LeagueResponse = z.infer<typeof LeagueResponseSchema>;

// ============================================================================
// TEAM TYPES
// ============================================================================

/**
 * Team with venue response
 */
export const TeamResponseSchema = z.object({
  team: TeamSchema,
  venue: VenueSchema,
});

export type TeamResponse = z.infer<typeof TeamResponseSchema>;

/**
 * Team statistics response (season statistics)
 */
export const TeamSeasonStatisticsSchema = z.object({
  team: TeamSchema,
  form: z.string().optional(),
  fixtures: z
    .object({
      played: z.object({
        home: z.number(),
        away: z.number(),
        total: z.number(),
      }),
      wins: z.object({
        home: z.number(),
        away: z.number(),
        total: z.number(),
      }),
      draws: z.object({
        home: z.number(),
        away: z.number(),
        total: z.number(),
      }),
      loses: z.object({
        home: z.number(),
        away: z.number(),
        total: z.number(),
      }),
    })
    .optional(),
  goals: z
    .object({
      for: z.object({
        total: z.object({
          home: z.number().nullable(),
          away: z.number().nullable(),
          total: z.number().nullable(),
        }),
        average: z.object({
          home: z.string().nullable(),
          away: z.string().nullable(),
          total: z.string().nullable(),
        }),
      }),
      against: z.object({
        total: z.object({
          home: z.number().nullable(),
          away: z.number().nullable(),
          total: z.number().nullable(),
        }),
        average: z.object({
          home: z.string().nullable(),
          away: z.string().nullable(),
          total: z.string().nullable(),
        }),
      }),
    })
    .optional(),
});

export type TeamSeasonStatistics = z.infer<typeof TeamSeasonStatisticsSchema>;

// ============================================================================
// PLAYER TYPES
// ============================================================================

/**
 * Player information
 */
export const PlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  age: z.number().nullable(),
  birth: z.object({
    date: z.string().nullable(),
    place: z.string().nullable(),
    country: z.string().nullable(),
  }),
  nationality: z.string().nullable(),
  height: z.string().nullable(),
  weight: z.string().nullable(),
  injured: z.boolean(),
  photo: z.string().url(),
});

export type Player = z.infer<typeof PlayerSchema>;

/**
 * Player season statistics
 */
export const PlayerSeasonStatsSchema = z.object({
  player: PlayerSchema,
  statistics: z.array(
    z.object({
      team: TeamSchema,
      league: LeagueSchema.extend({
        country: z.string(),
        flag: z.string().url().nullable(),
        season: z.number(),
      }),
      games: z.object({
        appearences: z.number().nullable(),
        lineups: z.number().nullable(),
        minutes: z.number().nullable(),
        number: z.number().nullable(),
        position: z.string().nullable(),
        rating: z.string().nullable(),
        captain: z.boolean(),
      }),
      substitutes: z.object({
        in: z.number().nullable(),
        out: z.number().nullable(),
        bench: z.number().nullable(),
      }),
      shots: z.object({
        total: z.number().nullable(),
        on: z.number().nullable(),
      }),
      goals: z.object({
        total: z.number().nullable(),
        conceded: z.number().nullable(),
        assists: z.number().nullable(),
        saves: z.number().nullable(),
      }),
      passes: z.object({
        total: z.number().nullable(),
        key: z.number().nullable(),
        accuracy: z.number().nullable(),
      }),
      tackles: z.object({
        total: z.number().nullable(),
        blocks: z.number().nullable(),
        interceptions: z.number().nullable(),
      }),
      duels: z.object({
        total: z.number().nullable(),
        won: z.number().nullable(),
      }),
      dribbles: z.object({
        attempts: z.number().nullable(),
        success: z.number().nullable(),
        past: z.number().nullable(),
      }),
      fouls: z.object({
        drawn: z.number().nullable(),
        committed: z.number().nullable(),
      }),
      cards: z.object({
        yellow: z.number().nullable(),
        yellowred: z.number().nullable(),
        red: z.number().nullable(),
      }),
      penalty: z.object({
        won: z.number().nullable(),
        commited: z.number().nullable(),
        scored: z.number().nullable(),
        missed: z.number().nullable(),
        saved: z.number().nullable(),
      }),
    })
  ),
});

export type PlayerSeasonStats = z.infer<typeof PlayerSeasonStatsSchema>;

/**
 * Squad player
 */
export const SquadPlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number().nullable(),
  number: z.number().nullable(),
  position: z.string(),
  photo: z.string().url(),
});

export type SquadPlayer = z.infer<typeof SquadPlayerSchema>;

/**
 * Team squad response
 */
export const TeamSquadResponseSchema = z.object({
  team: TeamSchema,
  players: z.array(SquadPlayerSchema),
});

export type TeamSquadResponse = z.infer<typeof TeamSquadResponseSchema>;

// ============================================================================
// INJURY TYPES
// ============================================================================

/**
 * Player injury information
 */
export const InjurySchema = z.object({
  player: z.object({
    id: z.number(),
    name: z.string(),
    photo: z.string().url(),
    type: z.string(),
    reason: z.string(),
  }),
  team: TeamSchema,
  fixture: z.object({
    id: z.number(),
    timezone: z.string(),
    date: z.string(),
    timestamp: z.number(),
  }),
  league: LeagueSchema.extend({
    country: z.string(),
    flag: z.string().url().nullable(),
    season: z.number(),
  }),
});

export type Injury = z.infer<typeof InjurySchema>;

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const schemas = {
  ApiResponse: ApiResponseSchema,
  Country: CountrySchema,
  League: LeagueSchema,
  Season: SeasonSchema,
  Team: TeamSchema,
  Venue: VenueSchema,
  Goals: GoalsSchema,
  Fixture: FixtureSchema,
  Score: ScoreSchema,
  Event: EventSchema,
  Lineup: LineupSchema,
  LineupPlayer: LineupPlayerSchema,
  TeamColors: TeamColorsSchema,
  MatchStatistics: MatchStatisticsSchema,
  TeamStatistic: TeamStatisticSchema,
  PlayerGameStats: PlayerGameStatsSchema,
  PlayerStats: PlayerStatsSchema,
  TeamPlayersStats: TeamPlayersStatsSchema,
  FixtureResponse: FixtureResponseSchema,
  StandingEntry: StandingEntrySchema,
  TeamRecord: TeamRecordSchema,
  StandingsResponse: StandingsResponseSchema,
  LeagueResponse: LeagueResponseSchema,
  TeamResponse: TeamResponseSchema,
  TeamSeasonStatistics: TeamSeasonStatisticsSchema,
  Player: PlayerSchema,
  PlayerSeasonStats: PlayerSeasonStatsSchema,
  SquadPlayer: SquadPlayerSchema,
  TeamSquadResponse: TeamSquadResponseSchema,
  Injury: InjurySchema,
  FixtureStatus: FixtureStatusSchema,
} as const;
