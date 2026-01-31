import { createClient } from '@/lib/supabase/client';
import type { FilterType, UserFilter } from '@/types/database.types';

export interface FiltersData {
  hiddenLeagues: number[];
  hiddenCountries: string[];
}

/**
 * Load user filters from the database
 */
export async function loadUserFilters(userId: string): Promise<FiltersData> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_filters')
    .select('*')
    .eq('user_id', userId)
    .eq('is_hidden', true);

  if (error) {
    console.error('Error loading user filters:', error);
    return { hiddenLeagues: [], hiddenCountries: [] };
  }

  const filters = data as UserFilter[];

  const hiddenLeagues: number[] = [];
  const hiddenCountries: string[] = [];

  filters.forEach((filter) => {
    switch (filter.filter_type) {
      case 'competition':
        const leagueId = parseInt(filter.filter_value, 10);
        if (!isNaN(leagueId)) {
          hiddenLeagues.push(leagueId);
        }
        break;
      case 'country':
        hiddenCountries.push(filter.filter_value);
        break;
      // 'sport' type not used in current implementation
    }
  });

  return { hiddenLeagues, hiddenCountries };
}

/**
 * Save user filters to the database
 * This replaces all existing filters with the new ones
 */
export async function saveUserFilters(
  userId: string,
  filters: FiltersData
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  // First, delete all existing filters for this user
  const { error: deleteError } = await supabase
    .from('user_filters')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Error deleting existing filters:', deleteError);
    return { error: new Error(deleteError.message) };
  }

  // Build new filter records
  const filterRecords: Array<{
    user_id: string;
    filter_type: FilterType;
    filter_value: string;
    is_hidden: boolean;
  }> = [];

  // Add hidden leagues
  filters.hiddenLeagues.forEach((leagueId) => {
    filterRecords.push({
      user_id: userId,
      filter_type: 'competition',
      filter_value: leagueId.toString(),
      is_hidden: true,
    });
  });

  // Add hidden countries
  filters.hiddenCountries.forEach((country) => {
    filterRecords.push({
      user_id: userId,
      filter_type: 'country',
      filter_value: country,
      is_hidden: true,
    });
  });

  // Only insert if there are filters to save
  if (filterRecords.length > 0) {
    const { error: insertError } = await supabase
      .from('user_filters')
      .insert(filterRecords as any);

    if (insertError) {
      console.error('Error saving user filters:', insertError);
      return { error: new Error(insertError.message) };
    }
  }

  return { error: null };
}
