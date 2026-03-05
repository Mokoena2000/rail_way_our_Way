import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/Supabase/supabase';
import { Line, Trip, TripWithStatus, TripStatus, mockLines, mockTrips, ReportWithStation } from '@/types/railway';

export function useLines() {
  return useQuery({
    queryKey: ['lines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lines')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (!data || data.length === 0) return mockLines;
      return data as Line[];
    },
  });
}

export function useTripsWithStatus(lineId: string | null) {
  return useQuery({
    queryKey: ['trips', lineId],
    queryFn: async () => {
      if (!lineId) return [];
      
      const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('line_id', lineId)
        .order('departure_time');
      
      if (error) throw error;
      
      const tripData = (!trips || trips.length === 0) 
        ? mockTrips.filter(t => t.line_id === lineId)
        : trips as Trip[];
      
      return tripData.map(trip => ({
        ...trip,
        status: 'scheduled' as TripStatus,
        reportCount: 0,
      }));
    },
    enabled: !!lineId,
    refetchInterval: 30000,
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ station_id, type, description }: { station_id: number; type: string; description?: string }) => {
      const { data, error } = await supabase
        .from('reports')
        .insert({ station_id, type, description: description || null })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useRecentAlerts() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, stations(name)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return (data || []) as ReportWithStation[];
    },
    refetchInterval: 30000,
  });
}

export function getReportCooldownStatus(): { allowed: boolean; remainingSeconds: number } {
  const lastReportTime = localStorage.getItem('lastReportTimestamp');
  if (!lastReportTime) return { allowed: true, remainingSeconds: 0 };
  const elapsed = Date.now() - parseInt(lastReportTime, 10);
  if (elapsed >= 60000) return { allowed: true, remainingSeconds: 0 };
  return { allowed: false, remainingSeconds: Math.ceil((60000 - elapsed) / 1000) };
}
