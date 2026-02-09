import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TripWithStatus, TripStatus, Report } from '@/types/railway';

const FRESHNESS_MINUTES = 120;

interface SearchParams {
  fromStation: string;
  toStation: string;
  departureTime: string;
}

function determineStatus(reports: Report[]): { status: TripStatus; count: number } {
  const now = new Date();
  const cutoff = new Date(now.getTime() - FRESHNESS_MINUTES * 60 * 1000);
  
  const recentReports = reports.filter(r => new Date(r.created_at) >= cutoff);
  
  if (recentReports.length === 0) {
    return { status: 'scheduled', count: 0 };
  }
  
  const statusCounts = recentReports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommon = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];
  return { status: mostCommon[0] as TripStatus, count: recentReports.length };
}

export function useSearchTrips(params: SearchParams | null) {
  return useQuery({
    queryKey: ['search-trips', params],
    queryFn: async () => {
      if (!params) return { trips: [], lineInfo: null };
      
      // Step 1: Find the line(s) for both stations
      const { data: fromStations } = await supabase
        .from('stations')
        .select('line_id')
        .eq('name', params.fromStation);
      
      const { data: toStations } = await supabase
        .from('stations')
        .select('line_id')
        .eq('name', params.toStation);
      
      if (!fromStations?.length || !toStations?.length) {
        return { trips: [], lineInfo: null };
      }
      
      // Step 2: Find common line (same-line trip)
      const fromLineIds = fromStations.map(s => s.line_id);
      const toLineIds = toStations.map(s => s.line_id);
      const commonLineId = fromLineIds.find(id => toLineIds.includes(id));
      
      if (!commonLineId) {
        // Transfer required - for MVP, return empty with transfer flag
        return { trips: [], lineInfo: null, requiresTransfer: true };
      }
      
      // Step 3: Get line info
      const { data: lineData } = await supabase
        .from('lines')
        .select('*')
        .eq('id', commonLineId)
        .single();
      
      // Step 4: Get all trips for this line after the selected time
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('line_id', commonLineId)
        .gte('departure_time', params.departureTime)
        .order('departure_time');
      
      if (tripsError) throw tripsError;
      
      if (!trips || trips.length === 0) {
        return { trips: [], lineInfo: lineData };
      }
      
      // Step 5: Get reports for these trips
      const tripIds = trips.map(t => t.id);
      const cutoff = new Date(Date.now() - FRESHNESS_MINUTES * 60 * 1000).toISOString();
      
      const { data: reports } = await supabase
        .from('reports')
        .select('*')
        .in('trip_id', tripIds)
        .gte('created_at', cutoff);
      
      // Map trips with their status
      const reportsByTrip = (reports || []).reduce((acc, r) => {
        if (!acc[r.trip_id]) acc[r.trip_id] = [];
        acc[r.trip_id].push(r as Report);
        return acc;
      }, {} as Record<string, Report[]>);
      
      const tripsWithStatus: TripWithStatus[] = trips.map(trip => {
        const tripReports = reportsByTrip[trip.id] || [];
        const { status, count } = determineStatus(tripReports);
        return {
          ...trip,
          status,
          reportCount: count,
        };
      });
      
      return { 
        trips: tripsWithStatus, 
        lineInfo: lineData,
        requiresTransfer: false 
      };
    },
    enabled: !!params,
    refetchInterval: 30000,
  });
}
