import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Station } from '@/types/railway';

export function useLineStations(lineId: string | null) {
  return useQuery({
    queryKey: ['stations', lineId],
    queryFn: async () => {
      if (!lineId) return [];
      
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('line_id', lineId)
        .order('created_at');
      
      if (error) throw error;
      return (data || []) as Station[];
    },
    enabled: !!lineId,
  });
}
