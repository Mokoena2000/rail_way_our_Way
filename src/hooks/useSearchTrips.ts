import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/Supabase/supabase';
import { TripWithStatus, TripStatus } from '@/types/railway';

interface SearchParams {
  fromStation: string;
  toStation: string;
  departureTime: string;
}

export function useSearchTrips(params: SearchParams | null) {
  return useQuery({
    queryKey: ['search-trips', params],
    queryFn: async () => {
      if (!params) return { trips: [], lineInfo: null };
      
      // 1. Find common line_name between the two stations
      const { data: fromStations } = await supabase
        .from('stations')
        .select('line_name')
        .eq('name', params.fromStation);
      
      const { data: toStations } = await supabase
        .from('stations')
        .select('line_name')
        .eq('name', params.toStation);
      
      if (!fromStations?.length || !toStations?.length) {
        return { trips: [], lineInfo: null };
      }
      
      const fromLines = fromStations.map(s => s.line_name);
      const toLines = toStations.map(s => s.line_name);
      const commonLine = fromLines.find(l => toLines.includes(l));
      
      // 2. Handle transfers if no direct common line exists
      if (!commonLine) {
        return { trips: [], lineInfo: null, requiresTransfer: true };
      }
      
      // 3. Get line metadata (color codes, etc.)
      const { data: lineData } = await supabase
        .from('lines')
        .select('*')
        .eq('name', commonLine)
        .single();

      if (!lineData) return { trips: [], lineInfo: null };

      // 4. Fetch trips for that line starting at the requested time
      const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('line_id', lineData.id)
        .gte('departure_time', params.departureTime)
        .order('departure_time');
      
      if (error) {
        console.error("Backend Error [useSearchTrips]:", error.message);
        throw error;
      }
      
      const tripsWithStatus: TripWithStatus[] = (trips || []).map(trip => ({
        ...trip,
        status: 'scheduled' as TripStatus,
        reportCount: 0,
      }));
      
      return { trips: tripsWithStatus, lineInfo: lineData, requiresTransfer: false };
    },
    enabled: !!params,
    refetchInterval: 30000, // Refresh every 30s to catch real-time delays
  });
}