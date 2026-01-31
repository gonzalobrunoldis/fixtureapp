'use client';

import { useMemo, useState } from 'react';
import {
  DatePicker,
  FixtureDetail,
  FixtureFilters,
  FixtureList,
} from '@/components/fixtures';
import { Header, PageContainer } from '@/components/layout';
import { useFixtures } from '@/hooks/use-fixtures';
import { getTodayAtStartOfDay } from '@/lib/utils/date';
import { useFiltersStore } from '@/stores/filters.store';
import { type FixtureDisplay } from '@/types/fixtures.types';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(
    getTodayAtStartOfDay()
  );
  const [selectedFixture, setSelectedFixture] = useState<FixtureDisplay | null>(
    null
  );

  // Fetch fixtures for selected date
  const { data: fixtures, isLoading, error } = useFixtures(selectedDate);

  // Get filter state
  const { hiddenLeagues, hiddenCountries } = useFiltersStore();

  // Filter fixtures based on hidden leagues and countries
  const filteredFixtures = useMemo(() => {
    if (!fixtures) return [];

    return fixtures.filter((fixture) => {
      // Check if league is hidden
      if (hiddenLeagues.has(fixture.league.id)) {
        return false;
      }

      // Check if country is hidden
      if (
        fixture.league.country &&
        hiddenCountries.has(fixture.league.country)
      ) {
        return false;
      }

      return true;
    });
  }, [fixtures, hiddenLeagues, hiddenCountries]);

  const handleFixtureClick = (fixture: FixtureDisplay) => {
    setSelectedFixture(fixture);
  };

  const handleDetailClose = () => {
    setSelectedFixture(null);
  };

  return (
    <PageContainer>
      <Header title="Home" subtitle="Today's matches and fixtures" />

      <div className="space-y-6">
        {/* Date Picker and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
          <FixtureFilters fixtures={fixtures || []} />
        </div>

        {/* Fixtures List */}
        <FixtureList
          fixtures={filteredFixtures}
          onFixtureClick={handleFixtureClick}
          isLoading={isLoading}
          error={error as Error | null}
        />
      </div>

      {/* Fixture Detail Modal */}
      <FixtureDetail
        fixture={selectedFixture}
        open={!!selectedFixture}
        onOpenChange={(open) => !open && handleDetailClose()}
      />
    </PageContainer>
  );
}
