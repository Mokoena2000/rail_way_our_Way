import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/Supabase/supabase';
import { Station } from '@/types/railway';

export function useLineStations(lineName: string | null) {
  return useQuery({
    queryKey: ['stations', lineName],
    queryFn: async () => {
      if (!lineName) return [];
      
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('line_name', lineName)
        .order('name');
      
      if (error) throw error;
      return (data || []) as Station[];
    },
    enabled: !!lineName,
  });
}
