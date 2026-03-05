import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/Supabase/supabase';

interface FareParams {
  fromId: number | null;
  toId: number | null;
}

export interface FareData {
  single_fare: number;
  return_fare?: number;
  weekly_fare?: number;
  monthly_fare?: number;
}

export function useRouteFare(params: FareParams) {
  return useQuery({
    queryKey: ['fare', params.fromId, params.toId],
    queryFn: async () => {
      if (!params.fromId || !params.toId) return null;

      const { data, error } = await supabase
        .from('fares')
        .select('single_fare, return_fare, weekly_fare, monthly_fare')
        .eq('origin_station_id', params.fromId)
        .eq('destination_station_id', params.toId)
        .maybeSingle(); // Use maybeSingle in case the fare isn't in the DB yet

      if (error) {
        console.error("Backend Error [useRouteFare]:", error.message);
        throw error;
      }

      return data as FareData;
    },
    enabled: !!(params.fromId && params.toId),
    staleTime: 1000 * 60 * 60, // Fares don't change hourly; cache for 1 hour
  });
}