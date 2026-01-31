'use client';

import { useState } from 'react';
import { FixtureList } from '@/components/fixtures';
import { Header, PageContainer } from '@/components/layout';
import { useFixtures } from '@/hooks/use-fixtures';
import { getTodayAtStartOfDay } from '@/lib/utils/date';
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

  const handleFixtureClick = (fixture: FixtureDisplay) => {
    setSelectedFixture(fixture);
    // TODO: Open detail modal in FIX-57
    console.log('Fixture clicked:', fixture);
  };

  return (
    <PageContainer>
      <Header title="Home" subtitle="Today's matches and fixtures" />

      <div className="space-y-6">
        {/* Date Picker - Will be added from FIX-54 branch when merged */}
        <div className="text-center text-sm text-muted-foreground">
          Showing fixtures for {selectedDate.toLocaleDateString()}
        </div>

        {/* Fixtures List */}
        <FixtureList
          fixtures={fixtures || []}
          onFixtureClick={handleFixtureClick}
          isLoading={isLoading}
          error={error as Error | null}
        />
      </div>
    </PageContainer>
  );
}
