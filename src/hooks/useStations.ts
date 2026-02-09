import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Station } from '@/types/railway';

export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stations')
        .select('*, lines:line_id(name, color_code)')
        .order('name');
      
      if (error) throw error;
      return data as (Station & { lines: { name: string; color_code: string } })[];
    },
  });
}

export function useStationsByLine(lineId: string | null) {
  return useQuery({
    queryKey: ['stations', lineId],
    queryFn: async () => {
      if (!lineId) return [];
      
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('line_id', lineId)
        .order('name');
      
      if (error) throw error;
      return data as Station[];
    },
    enabled: !!lineId,
  });
}
