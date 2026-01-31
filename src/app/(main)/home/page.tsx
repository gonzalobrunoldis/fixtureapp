'use client';

import { useState } from 'react';
import { DatePicker } from '@/components/fixtures';
import { Header, PageContainer } from '@/components/layout';
import { getTodayAtStartOfDay } from '@/lib/utils/date';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(
    getTodayAtStartOfDay()
  );

  return (
    <PageContainer>
      <Header title="Home" subtitle="Today's matches and fixtures" />

      <div className="space-y-6">
        {/* Date Picker */}
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Fixtures will go here */}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              Fixtures for {selectedDate.toLocaleDateString()} coming soon...
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
