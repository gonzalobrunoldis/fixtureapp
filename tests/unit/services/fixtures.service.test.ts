import { describe, it, expect } from 'vitest';
import { groupFixturesByLeague } from '@/services/fixtures.service';
import {
  mockAllFixtures,
  mockUpcomingFixture,
  mockPremierLeagueFixtures,
} from '../../__fixtures__/fixtures';

describe('Fixtures Service', () => {
  describe('groupFixturesByLeague', () => {
    it('groups fixtures by league ID', () => {
      const grouped = groupFixturesByLeague(mockAllFixtures);

      // Should have unique leagues
      expect(grouped.size).toBe(5); // 5 different leagues in mockAllFixtures
    });

    it('returns empty map for empty array', () => {
      const grouped = groupFixturesByLeague([]);
      expect(grouped.size).toBe(0);
    });

    it('groups multiple fixtures from same league together', () => {
      const grouped = groupFixturesByLeague(mockPremierLeagueFixtures);

      expect(grouped.size).toBe(1);
      expect(grouped.get(39)?.length).toBe(2); // 2 Premier League fixtures
    });

    it('preserves fixture data in groups', () => {
      const grouped = groupFixturesByLeague([mockUpcomingFixture]);

      const premierLeagueFixtures = grouped.get(39);
      expect(premierLeagueFixtures).toBeDefined();
      expect(premierLeagueFixtures?.[0].id).toBe(mockUpcomingFixture.id);
      expect(premierLeagueFixtures?.[0].homeTeam.name).toBe(
        mockUpcomingFixture.homeTeam.name
      );
    });

    it('sorts fixtures within each league by start time', () => {
      const grouped = groupFixturesByLeague(mockPremierLeagueFixtures);

      const fixtures = grouped.get(39);
      expect(fixtures).toBeDefined();
      if (fixtures && fixtures.length >= 2) {
        // Earlier fixture should come first
        expect(fixtures[0].startTime.getTime()).toBeLessThan(
          fixtures[1].startTime.getTime()
        );
      }
    });
  });
});
