'use client';

import { Filter, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useFiltersStore } from '@/stores/filters.store';
import { type FixtureDisplay } from '@/types/fixtures.types';

interface LeagueOption {
  id: number;
  name: string;
  logo: string;
  country?: string;
  count: number;
}

interface CountryOption {
  name: string;
  count: number;
}

interface FixtureFiltersProps {
  fixtures: FixtureDisplay[];
}

export function FixtureFilters({ fixtures }: FixtureFiltersProps) {
  const {
    hiddenLeagues,
    hiddenCountries,
    toggleLeague,
    toggleCountry,
    showAllLeagues,
    showAllCountries,
    clearFilters,
    hasActiveFilters,
  } = useFiltersStore();

  // Extract unique leagues from fixtures
  const leagueOptions: LeagueOption[] = [];
  const leagueMap = new Map<number, LeagueOption>();

  fixtures.forEach((fixture) => {
    const existing = leagueMap.get(fixture.league.id);
    if (existing) {
      existing.count++;
    } else {
      leagueMap.set(fixture.league.id, {
        id: fixture.league.id,
        name: fixture.league.name,
        logo: fixture.league.logo,
        country: fixture.league.country,
        count: 1,
      });
    }
  });

  leagueMap.forEach((league) => leagueOptions.push(league));
  leagueOptions.sort((a, b) => a.name.localeCompare(b.name));

  // Extract unique countries from fixtures
  const countryOptions: CountryOption[] = [];
  const countryMap = new Map<string, CountryOption>();

  fixtures.forEach((fixture) => {
    const country = fixture.league.country;
    if (!country) return;

    const existing = countryMap.get(country);
    if (existing) {
      existing.count++;
    } else {
      countryMap.set(country, {
        name: country,
        count: 1,
      });
    }
  });

  countryMap.forEach((country) => countryOptions.push(country));
  countryOptions.sort((a, b) => a.name.localeCompare(b.name));

  const activeFilterCount = hiddenLeagues.size + hiddenCountries.size;

  const handleSelectAllLeagues = () => {
    showAllLeagues();
  };

  const handleDeselectAllLeagues = () => {
    const allLeagueIds = leagueOptions.map((l) => l.id);
    useFiltersStore.setState({ hiddenLeagues: new Set(allLeagueIds) });
  };

  const handleSelectAllCountries = () => {
    showAllCountries();
  };

  const handleDeselectAllCountries = () => {
    const allCountries = countryOptions.map((c) => c.name);
    useFiltersStore.setState({ hiddenCountries: new Set(allCountries) });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Leagues Section */}
          {leagueOptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Competitions</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={handleSelectAllLeagues}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={handleDeselectAllLeagues}
                  >
                    None
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {leagueOptions.map((league) => {
                  const isVisible = !hiddenLeagues.has(league.id);
                  return (
                    <label
                      key={league.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2"
                    >
                      <Checkbox
                        checked={isVisible}
                        onCheckedChange={() => toggleLeague(league.id)}
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={league.logo} alt={league.name} />
                        <AvatarFallback>{league.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm">{league.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({league.count})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {leagueOptions.length > 0 && countryOptions.length > 0 && (
            <Separator />
          )}

          {/* Countries Section */}
          {countryOptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Countries</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={handleSelectAllCountries}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={handleDeselectAllCountries}
                  >
                    None
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {countryOptions.map((country) => {
                  const isVisible = !hiddenCountries.has(country.name);
                  return (
                    <label
                      key={country.name}
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2"
                    >
                      <Checkbox
                        checked={isVisible}
                        onCheckedChange={() => toggleCountry(country.name)}
                      />
                      <span className="flex-1 text-sm">{country.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({country.count})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {leagueOptions.length === 0 && countryOptions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No filters available. Load some fixtures first.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
