import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Train } from 'lucide-react';
import { Header } from '@/components/Header';
import { StationCard } from '@/components/StationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface Station {
  id: string;
  name: string;
  line_id: string;
}

interface Line {
  id: string;
  name: string;
  color_code: string;
}

// Mock data for development
const mockLines: Line[] = [
  { id: '1', name: 'Northern Line', color_code: '#E07A5F' },
  { id: '2', name: 'Southern Line', color_code: '#81B29A' },
  { id: '3', name: 'Central Line', color_code: '#3D405B' },
];

const mockStations: (Station & { lineName?: string; lineColor?: string })[] = [
  // Northern Line
  { id: '1', name: 'Cape Town', line_id: '1', lineName: 'Northern Line', lineColor: '#E07A5F' },
  { id: '2', name: 'Bellville', line_id: '1', lineName: 'Northern Line', lineColor: '#E07A5F' },
  { id: '3', name: 'Parow', line_id: '1', lineName: 'Northern Line', lineColor: '#E07A5F' },
  { id: '4', name: 'Goodwood', line_id: '1', lineName: 'Northern Line', lineColor: '#E07A5F' },
  { id: '5', name: 'Mutual', line_id: '1', lineName: 'Northern Line', lineColor: '#E07A5F' },
  // Southern Line
  { id: '6', name: 'Cape Town', line_id: '2', lineName: 'Southern Line', lineColor: '#81B29A' },
  { id: '7', name: "Simon's Town", line_id: '2', lineName: 'Southern Line', lineColor: '#81B29A' },
  { id: '8', name: 'Fish Hoek', line_id: '2', lineName: 'Southern Line', lineColor: '#81B29A' },
  { id: '9', name: 'Muizenberg', line_id: '2', lineName: 'Southern Line', lineColor: '#81B29A' },
  { id: '10', name: 'Retreat', line_id: '2', lineName: 'Southern Line', lineColor: '#81B29A' },
  // Central Line  
  { id: '11', name: 'Cape Town', line_id: '3', lineName: 'Central Line', lineColor: '#3D405B' },
  { id: '12', name: 'Langa', line_id: '3', lineName: 'Central Line', lineColor: '#3D405B' },
  { id: '13', name: 'Bonteheuwel', line_id: '3', lineName: 'Central Line', lineColor: '#3D405B' },
];

export default function SchedulePage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState<(Station & { lineName?: string; lineColor?: string })[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch lines
        const { data: linesData, error: linesError } = await supabase
          .from('lines')
          .select('*')
          .order('name');

        if (linesError) throw linesError;

        // Fetch stations
        const { data: stationsData, error: stationsError } = await supabase
          .from('stations')
          .select('*')
          .order('name');

        if (stationsError) throw stationsError;

        if (linesData && linesData.length > 0 && stationsData && stationsData.length > 0) {
          setLines(linesData);
          // Map stations with line info
          const stationsWithLines = stationsData.map(station => {
            const line = linesData.find(l => l.id === station.line_id);
            return {
              ...station,
              lineName: line?.name,
              lineColor: line?.color_code,
            };
          });
          setStations(stationsWithLines);
        } else {
          // Use mock data
          setLines(mockLines);
          setStations(mockStations);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLines(mockLines);
        setStations(mockStations);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter stations by search query
  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return stations;
    const query = searchQuery.toLowerCase();
    return stations.filter(station => 
      station.name.toLowerCase().includes(query) ||
      station.lineName?.toLowerCase().includes(query)
    );
  }, [stations, searchQuery]);

  // Group stations by line
  const groupedStations = useMemo(() => {
    const groups: Record<string, typeof filteredStations> = {};
    
    filteredStations.forEach(station => {
      const lineKey = station.lineName || 'Other';
      if (!groups[lineKey]) {
        groups[lineKey] = [];
      }
      groups[lineKey].push(station);
    });

    return groups;
  }, [filteredStations]);

  const handleStationClick = (stationName: string) => {
    navigate(`/schedule/${encodeURIComponent(stationName)}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header 
        title="Station Directory" 
        subtitle="Find your departure point"
      />
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find a station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base bg-card border-2 border-foreground rounded-2xl 
                       font-medium placeholder:text-muted-foreground focus-visible:ring-primary"
          />
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, groupIdx) => (
              <div key={groupIdx}>
                <Skeleton className="h-6 w-40 mb-3" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedStations).length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-card-foreground mb-2">
              No stations found
            </h3>
            <p className="text-muted-foreground max-w-xs">
              Try a different search term or check the spelling.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedStations).map(([lineName, lineStations]) => {
              const lineColor = lineStations[0]?.lineColor || '#E07A5F';
              
              return (
                <motion.section 
                  key={lineName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Line Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-3 h-3 rounded-full border-2 border-foreground"
                      style={{ backgroundColor: lineColor }}
                    />
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                      {lineName}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      ({lineStations.length} station{lineStations.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  
                  {/* Stations List */}
                  <div className="space-y-2">
                    {lineStations.map((station, index) => (
                      <StationCard
                        key={station.id}
                        id={station.id}
                        name={station.name}
                        lineColor={lineColor}
                        onClick={() => handleStationClick(station.name)}
                        index={index}
                      />
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
