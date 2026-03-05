import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/Supabase/supabase';
import { Search, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';
import { StationCard } from '@/components/StationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Station, lineColors } from '@/types/railway';

export default function SchedulePage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState<(Station & { lineColor?: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');

      if (!error && data?.length) {
        const mapped = (data as Station[]).map(s => ({
          ...s,
          lineColor: lineColors[s.line_name] || '#E07A5F',
        }));
        setStations(mapped);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return stations;
    const query = searchQuery.toLowerCase();
    return stations.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.line_name.toLowerCase().includes(query)
    );
  }, [stations, searchQuery]);

  const groupedStations = useMemo(() => {
    const groups: Record<string, typeof filteredStations> = {};
    filteredStations.forEach(station => {
      const key = station.line_name;
      if (!groups[key]) groups[key] = [];
      groups[key].push(station);
    });
    return groups;
  }, [filteredStations]);

  const handleStationClick = (stationName: string) => {
    navigate(`/schedule/${encodeURIComponent(stationName)}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Station Directory" subtitle="Find your departure point" />
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find a station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base bg-card border-2 border-foreground rounded-2xl font-medium placeholder:text-muted-foreground focus-visible:ring-primary"
          />
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-40 mb-3" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-16 w-full rounded-2xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedStations).length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-card-foreground mb-2">No stations found</h3>
            <p className="text-muted-foreground max-w-xs">Try a different search term.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedStations).map(([lineName, lineStations]) => {
              const lineColor = lineStations[0]?.lineColor || '#E07A5F';
              return (
                <motion.section key={lineName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full border-2 border-foreground" style={{ backgroundColor: lineColor }} />
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{lineName} Line</h2>
                    <span className="text-xs text-muted-foreground">({lineStations.length})</span>
                  </div>
                  <div className="space-y-2">
                    {lineStations.map((station, index) => (
                      <StationCard key={station.id} id={String(station.id)} name={station.name} lineColor={lineColor} onClick={() => handleStationClick(station.name)} index={index} />
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
