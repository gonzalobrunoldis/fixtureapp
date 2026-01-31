'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatDateForApi,
  getDateRange,
  getNextDay,
  getPreviousDay,
  getShortDayLabel,
  getTodayAtStartOfDay,
  isToday,
} from '@/lib/utils/date';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function DatePicker({
  selectedDate,
  onDateChange,
  className,
}: DatePickerProps) {
  const [dates, setDates] = useState<Date[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Generate date range centered on selected date
  useEffect(() => {
    const dateRange = getDateRange(selectedDate, 14); // 14 days before and after
    setDates(dateRange);
  }, [selectedDate]);

  // Auto-scroll to selected date on mount and when selected date changes
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = selectedRef.current;
      const containerWidth = container.offsetWidth;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;

      // Center the selected element
      const scrollPosition =
        elementLeft - containerWidth / 2 + elementWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [selectedDate]);

  const handlePreviousDay = () => {
    onDateChange(getPreviousDay(selectedDate));
  };

  const handleNextDay = () => {
    onDateChange(getNextDay(selectedDate));
  };

  const handleDateClick = (date: Date) => {
    onDateChange(date);
  };

  const handleTodayClick = () => {
    onDateChange(getTodayAtStartOfDay());
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Previous Day Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePreviousDay}
        aria-label="Previous day"
        className="shrink-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Scrollable Date List */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {dates.map((date) => {
            const isSelected =
              formatDateForApi(date) === formatDateForApi(selectedDate);
            const isTodayDate = isToday(date);

            return (
              <button
                key={formatDateForApi(date)}
                ref={isSelected ? selectedRef : null}
                onClick={() => handleDateClick(date)}
                className={cn(
                  'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected &&
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                  isTodayDate &&
                    !isSelected &&
                    'border border-primary text-primary'
                )}
              >
                {getShortDayLabel(date)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Day Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextDay}
        aria-label="Next day"
        className="shrink-0"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Today Button - Only show if not already on today */}
      {!isToday(selectedDate) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleTodayClick}
          className="shrink-0"
        >
          Today
        </Button>
      )}
    </div>
  );
}
