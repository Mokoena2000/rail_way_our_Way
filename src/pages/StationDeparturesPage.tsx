import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Train, Moon } from 'lucide-react';
import { DepartureCard } from '@/components/DepartureCard';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface Trip {
  id: string;
  departure_time: string;
  origin: string;
  destination: string;
  line_id: string;
}

// Mock departures for development
const mockDepartures: Trip[] = [
  { id: '1', departure_time: '06:30', origin: 'Cape Town', destination: 'Bellville', line_id: '1' },
  { id: '2', departure_time: '07:00', origin: 'Cape Town', destination: 'Bellville', line_id: '1' },
  { id: '3', departure_time: '07:30', origin: 'Cape Town', destination: "Simon's Town", line_id: '2' },
  { id: '4', departure_time: '08:00', origin: 'Cape Town', destination: 'Bellville', line_id: '1' },
  { id: '5', departure_time: '08:30', origin: 'Cape Town', destination: 'Fish Hoek', line_id: '2' },
  { id: '6', departure_time: '09:00', origin: 'Cape Town', destination: 'Bellville', line_id: '1' },
  { id: '7', departure_time: '16:00', origin: 'Cape Town', destination: 'Retreat', line_id: '2' },
  { id: '8', departure_time: '17:00', origin: 'Cape Town', destination: 'Bellville', line_id: '1' },
  { id: '9', departure_time: '17:30', origin: 'Cape Town', destination: "Simon's Town", line_id: '2' },
  { id: '10', departure_time: '18:00', origin: 'Cape Town', destination: 'Bellville', line_id: '1' },
];

export default function StationDeparturesPage() {
  const { stationName } = useParams<{ stationName: string }>();
  const navigate = useNavigate();
  const [departures, setDepartures] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const decodedStationName = stationName ? decodeURIComponent(stationName) : '';

  useEffect(() => {
    const fetchDepartures = async () => {
      setIsLoading(true);
      
      try {
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('origin', decodedStationName)
          .order('departure_time', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setDepartures(data);
        } else {
          // Fall back to mock data filtered by station
          const filtered = mockDepartures.filter(
            d => d.origin.toLowerCase() === decodedStationName.toLowerCase()
          );
          setDepartures(filtered);
        }
      } catch (error) {
        console.error('Error fetching departures:', error);
        // Use mock data as fallback
        const filtered = mockDepartures.filter(
          d => d.origin.toLowerCase() === decodedStationName.toLowerCase()
        );
        setDepartures(filtered);
      } finally {
        setIsLoading(false);
      }
    };

    if (decodedStationName) {
      fetchDepartures();
    }
  }, [decodedStationName]);

  // Sort by time and determine status
  const sortedDepartures = useMemo(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return departures
      .map(dep => ({
        ...dep,
        status: dep.departure_time > currentTime ? 'on-time' : 'delayed' as const
      }))
      .sort((a, b) => a.departure_time.localeCompare(b.departure_time));
  }, [departures]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 pt-12 border-b-3 border-foreground">
        <div className="container max-w-lg mx-auto">
          <button
            onClick={() => navigate('/schedule')}
            className="flex items-center gap-2 text-secondary-foreground/80 hover:text-secondary-foreground 
                       transition-colors mb-3 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Stations</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center border-2 border-foreground">
              <Train className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Departures from</h1>
              <p className="text-2xl font-black text-primary">{decodedStationName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Departures List */}
      <main className="container max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : sortedDepartures.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Moon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-card-foreground mb-2">
              No scheduled departures
            </h3>
            <p className="text-muted-foreground max-w-xs">
              There are no trains departing from this station right now. Check back later!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground mb-4">
              {sortedDepartures.length} departure{sortedDepartures.length !== 1 ? 's' : ''} found
            </p>
            {sortedDepartures.map((departure, index) => (
              <DepartureCard
                key={departure.id}
                departureTime={departure.departure_time}
                destination={departure.destination}
                status={departure.status as 'on-time' | 'delayed'}
                index={index}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
