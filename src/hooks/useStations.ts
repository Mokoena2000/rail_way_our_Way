import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/Supabase/supabase'; // Manual Client
import { Station } from '@/types/railway';

/**
 * Fetches all 63 Cape Town stations seeded in the manual database.
 */
export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Backend Error [useStations]:", error.message);
        throw error;
      }
      return (data || []) as Station[];
    },
    staleTime: 1000 * 60 * 10, // Stations rarely change; cache for 10 mins
  });
}

/**
 * Filters stations by their specific line (Southern, Northern, etc.).
 */
export function useStationsByLine(lineName: string | null) {
  return useQuery({
    queryKey: ['stations', lineName],
    queryFn: async () => {
      if (!lineName) return [];
      
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('line_name', lineName)
        .order('name');
      
      if (error) {
        console.error("Backend Error [useStationsByLine]:", error.message);
        throw error;
      }
      return (data || []) as Station[];
    },
    enabled: !!lineName,
  });
}