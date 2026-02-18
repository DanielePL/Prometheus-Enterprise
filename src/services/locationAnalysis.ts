import { supabase } from '@/lib/supabase';
import { isDemoMode } from './demoData';
import {
  DEMO_MARKET_OVERVIEW,
  DEMO_PLZ_DATA,
  DEMO_UTILIZATION_HEATMAP,
  DEMO_SEASONAL_PATTERNS,
  DEMO_DISTANCE_DISTRIBUTION,
} from './locationDemoData';
import type {
  MarketOverview,
  PLZData,
  SeasonalPattern,
  DistanceSegment,
} from './locationDemoData';

export const locationAnalysisService = {
  async getOverview(gymId: string): Promise<MarketOverview> {
    if (isDemoMode()) {
      return DEMO_MARKET_OVERVIEW;
    }

    const { data, error } = await supabase
      .from('location_market_overview')
      .select('*')
      .eq('gym_id', gymId)
      .single();

    if (error) throw error;
    return data as MarketOverview;
  },

  async getPLZData(gymId: string): Promise<PLZData[]> {
    if (isDemoMode()) {
      return DEMO_PLZ_DATA;
    }

    const { data, error } = await supabase
      .from('location_plz_data')
      .select('*')
      .eq('gym_id', gymId)
      .order('members', { ascending: false });

    if (error) throw error;
    return data as PLZData[];
  },

  async getUtilizationHeatmap(gymId: string): Promise<number[][]> {
    if (isDemoMode()) {
      return DEMO_UTILIZATION_HEATMAP;
    }

    const { data, error } = await supabase
      .from('location_utilization')
      .select('day_of_week, hour, occupancy_pct')
      .eq('gym_id', gymId)
      .order('day_of_week')
      .order('hour');

    if (error) throw error;

    // Transform flat rows into 7×17 grid
    const grid: number[][] = Array.from({ length: 7 }, () => Array(17).fill(0));
    for (const row of data as { day_of_week: number; hour: number; occupancy_pct: number }[]) {
      grid[row.day_of_week][row.hour - 6] = row.occupancy_pct;
    }
    return grid;
  },

  async getSeasonalPatterns(gymId: string): Promise<SeasonalPattern[]> {
    if (isDemoMode()) {
      return DEMO_SEASONAL_PATTERNS;
    }

    const { data, error } = await supabase
      .from('location_seasonal_patterns')
      .select('*')
      .eq('gym_id', gymId)
      .order('sort_order');

    if (error) throw error;
    return data as SeasonalPattern[];
  },

  async getDistanceDistribution(gymId: string): Promise<DistanceSegment[]> {
    if (isDemoMode()) {
      return DEMO_DISTANCE_DISTRIBUTION;
    }

    const { data, error } = await supabase
      .from('location_distance_distribution')
      .select('*')
      .eq('gym_id', gymId)
      .order('sort_order');

    if (error) throw error;
    return data as DistanceSegment[];
  },
};
