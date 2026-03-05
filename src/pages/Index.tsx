import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/Supabase/supabase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Moon, Train, AlertTriangle } from 'lucide-react';
import { Station } from '@/types/railway';

interface Trip {
  id: string;
  line_id: string;
  departure_time: string;
  origin: string;
  destination: string;
}

type Direction = 'inbound' | 'outbound' | null;

const Index = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [fromStationId, setFromStationId] = useState('');
  const [toStationId, setToStationId] = useState('');
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [direction, setDirection] = useState<Direction>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');

      if (!error && data?.length) {
        setStations(data as Station[]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleFromChange = (value: string) => {
    setFromStationId(value);
    setTrips(null);
    setErrorMessage('');
    setDirection(null);
  };

  const handleToChange = (value: string) => {
    setToStationId(value);
    setTrips(null);
    setErrorMessage('');
    setDirection(null);
  };

  const handleFindTrains = async () => {
    const fromStation = stations.find(s => String(s.id) === fromStationId);
    const toStation = stations.find(s => String(s.id) === toStationId);
    if (!fromStation || !toStation) return;

    if (fromStation.line_name !== toStation.line_name) {
      setErrorMessage('Transfers are not supported yet. Please select stations on the same line.');
      setTrips(null);
      return;
    }

    setIsSearching(true);
    setErrorMessage('');

    const { data } = await supabase
      .from('trips')
      .select('*')
      .order('departure_time', { ascending: true });

    const tripsData: Trip[] = (data || []) as Trip[];
    
    const now = new Date();
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const filteredTrips = tripsData.filter(trip => {
      const tripTime = trip.departure_time.slice(0, 5);
      return tripTime >= currentTimeString;
    });
    
    setTrips(filteredTrips);
    setIsSearching(false);
  };

  const isValid = fromStationId && toStationId && fromStationId !== toStationId;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="w-full max-w-md mx-auto">
        {/* Hero */}
        <div className="text-center mb-6 pt-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <Train className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Where are you heading?
          </h1>
        </div>

        {/* Search Card */}
        <div className="bg-card rounded-2xl p-6 border-2 border-foreground neo-shadow">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="ml-2 text-card-foreground">Loading stations...</span>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-card-foreground/80 mb-2 block">Origin</label>
                <Select value={fromStationId} onValueChange={handleFromChange}>
                  <SelectTrigger className="w-full h-14 bg-cream border-2 border-foreground text-foreground font-medium text-base rounded-xl neo-shadow-sm">
                    <SelectValue placeholder="Select departure station" />
                  </SelectTrigger>
                  <SelectContent className="bg-cream border-2 border-foreground z-50">
                    {stations.map(station => (
                      <SelectItem key={station.id} value={String(station.id)} disabled={String(station.id) === toStationId} className="text-foreground hover:bg-primary/20 font-medium">
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-card-foreground/80 mb-2 block">Destination</label>
                <Select value={toStationId} onValueChange={handleToChange}>
                  <SelectTrigger className="w-full h-14 bg-cream border-2 border-foreground text-foreground font-medium text-base rounded-xl neo-shadow-sm">
                    <SelectValue placeholder="Select arrival station" />
                  </SelectTrigger>
                  <SelectContent className="bg-cream border-2 border-foreground z-50">
                    {stations.map(station => (
                      <SelectItem key={station.id} value={String(station.id)} disabled={String(station.id) === fromStationId} className="text-foreground hover:bg-primary/20 font-medium">
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-foreground rounded-xl neo-shadow transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                onClick={handleFindTrains}
                disabled={!isValid || isSearching}
              >
                {isSearching ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Searching...</>) : 'Find Trains'}
              </Button>

              {errorMessage && (
                <p className="text-destructive text-sm text-center font-medium">{errorMessage}</p>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {trips !== null && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Available Trains</h3>
            {trips.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center bg-card rounded-2xl border-2 border-foreground">
                <Moon className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-card-foreground font-bold">No trains found.</p>
                <p className="text-sm text-card-foreground/70 mt-1">Try different stations or check tomorrow.</p>
              </div>
            ) : (
              trips.map((trip, index) => (
                <div key={trip.id} className="bg-card rounded-2xl p-4 flex items-center justify-between border-2 border-foreground neo-shadow-sm animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div>
                    <p className="text-3xl font-extrabold text-primary">{trip.departure_time.slice(0, 5)}</p>
                    <p className="text-sm text-card-foreground/80 font-medium mt-1">Train to {trip.destination}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
