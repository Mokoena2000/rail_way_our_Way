import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Line, Trip, Report, TripWithStatus, TripStatus, mockLines, mockTrips } from '@/types/railway';

const FRESHNESS_MINUTES = 120;

// Helper to determine status from recent reports
function determineStatus(reports: Report[]): { status: TripStatus; count: number } {
  const now = new Date();
  const cutoff = new Date(now.getTime() - FRESHNESS_MINUTES * 60 * 1000);
  
  const recentReports = reports.filter(r => new Date(r.created_at) >= cutoff);
  
  if (recentReports.length === 0) {
    return { status: 'scheduled', count: 0 };
  }
  
  // Get the most common status from recent reports
  const statusCounts = recentReports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommon = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];
  return { status: mostCommon[0] as TripStatus, count: recentReports.length };
}

export function useLines() {
  return useQuery({
    queryKey: ['lines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lines')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Fall back to mock data if empty
      if (!data || data.length === 0) {
        return mockLines;
      }
      
      return data as Line[];
    },
  });
}

export function useTripsWithStatus(lineId: string | null) {
  return useQuery({
    queryKey: ['trips', lineId],
    queryFn: async () => {
      if (!lineId) return [];
      
      // Fetch trips for the line
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('line_id', lineId)
        .order('departure_time');
      
      if (tripsError) throw tripsError;
      
      // Use mock data if empty
      const tripData = (!trips || trips.length === 0) 
        ? mockTrips.filter(t => t.line_id === lineId)
        : trips as Trip[];
      
      if (tripData.length === 0) {
        // If still no data, use mock trips for line 1 as fallback
        return mockTrips.slice(0, 5).map(t => ({
          ...t,
          line_id: lineId,
          status: 'scheduled' as TripStatus,
          reportCount: 0,
        }));
      }
      
      // Fetch all reports for these trips within freshness window
      const tripIds = tripData.map(t => t.id);
      const cutoff = new Date(Date.now() - FRESHNESS_MINUTES * 60 * 1000).toISOString();
      
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .in('trip_id', tripIds)
        .gte('created_at', cutoff);
      
      if (reportsError) throw reportsError;
      
      // Map trips with their status
      const reportsByTrip = (reports || []).reduce((acc, r) => {
        if (!acc[r.trip_id]) acc[r.trip_id] = [];
        acc[r.trip_id].push(r as Report);
        return acc;
      }, {} as Record<string, Report[]>);
      
      return tripData.map(trip => {
        const tripReports = reportsByTrip[trip.id] || [];
        const { status, count } = determineStatus(tripReports);
        return {
          ...trip,
          status,
          reportCount: count,
        } as TripWithStatus;
      });
    },
    enabled: !!lineId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Rate limiting constants
const REPORT_COOLDOWN_MS = 60000; // 1 minute cooldown between reports
const REPORT_TIMESTAMP_KEY = 'lastReportTimestamp';

// Helper to check rate limit
function checkReportRateLimit(): { allowed: boolean; remainingSeconds: number } {
  const lastReportTime = localStorage.getItem(REPORT_TIMESTAMP_KEY);
  if (!lastReportTime) {
    return { allowed: true, remainingSeconds: 0 };
  }
  
  const elapsed = Date.now() - parseInt(lastReportTime, 10);
  if (elapsed >= REPORT_COOLDOWN_MS) {
    return { allowed: true, remainingSeconds: 0 };
  }
  
  const remainingSeconds = Math.ceil((REPORT_COOLDOWN_MS - elapsed) / 1000);
  return { allowed: false, remainingSeconds };
}

// Helper to record submission timestamp
function recordReportSubmission(): void {
  localStorage.setItem(REPORT_TIMESTAMP_KEY, Date.now().toString());
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: 'on_time' | 'delayed' | 'cancelled' }) => {
      // Check rate limit before submitting
      const { allowed, remainingSeconds } = checkReportRateLimit();
      if (!allowed) {
        throw new Error(`Please wait ${remainingSeconds} seconds before submitting another report`);
      }
      
      const { data, error } = await supabase
        .from('reports')
        .insert({ trip_id: tripId, status })
        .select()
        .single();
      
      if (error) throw error;
      
      // Record successful submission for rate limiting
      recordReportSubmission();
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

// Export for use in UI to show remaining cooldown
export function getReportCooldownStatus(): { allowed: boolean; remainingSeconds: number } {
  return checkReportRateLimit();
}

export function useRecentAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const cutoff = new Date(Date.now() - FRESHNESS_MINUTES * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          trips:trip_id (
            departure_time,
            origin,
            destination,
            lines:line_id (name)
          )
        `)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });
}
