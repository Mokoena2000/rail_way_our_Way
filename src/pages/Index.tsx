import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Moon, Train, AlertTriangle } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  line_id: string;
}

interface Trip {
  id: string;
  line_id: string;
  departure_time: string;
  origin: string;
  destination: string;
  created_at?: string;
}

interface Incident {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

type Direction = 'inbound' | 'outbound' | null;

// Mock data fallback
const mockTrips: Trip[] = [
  { id: '1', line_id: '1', departure_time: '07:12', origin: 'Cape Town', destination: 'Bellville' },
  { id: '2', line_id: '1', departure_time: '07:30', origin: 'Cape Town', destination: 'Bellville' },
  { id: '3', line_id: '1', departure_time: '07:45', origin: 'Cape Town', destination: 'Bellville' },
  { id: '4', line_id: '1', departure_time: '08:00', origin: 'Cape Town', destination: 'Simon\'s Town' },
  { id: '5', line_id: '1', departure_time: '08:15', origin: 'Cape Town', destination: 'Bellville' },
];

const mockStations: Station[] = [
  { id: '1', name: 'Cape Town', line_id: '1' },
  { id: '2', name: 'Salt River', line_id: '1' },
  { id: '3', name: 'Woodstock', line_id: '1' },
  { id: '4', name: 'Observatory', line_id: '1' },
  { id: '5', name: 'Mowbray', line_id: '1' },
  { id: '6', name: 'Rosebank', line_id: '1' },
  { id: '7', name: 'Rondebosch', line_id: '1' },
  { id: '8', name: 'Claremont', line_id: '1' },
  { id: '9', name: 'Bellville', line_id: '1' },
  { id: '10', name: 'Simon\'s Town', line_id: '2' },
];

const mockIncidents: Incident[] = [
  { id: '1', type: 'Delay', description: 'Northern Line experiencing 15min delays due to signal fault', created_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: '2', type: 'Cancel', description: 'Southern Line 08:30 service cancelled', created_at: new Date(Date.now() - 60 * 60000).toISOString() },
];

const Index = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [fromStationId, setFromStationId] = useState('');
  const [toStationId, setToStationId] = useState('');
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [direction, setDirection] = useState<Direction>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch stations
      const { data: stationData, error: stationError } = await supabase
        .from('stations')
        .select('id, name, line_id')
        .order('name', { ascending: true });

      if (stationError || !stationData?.length) {
        console.log('Using mock stations');
        setStations(mockStations);
      } else {
        setStations(stationData);
      }

      // Use mock incidents for now
      setIncidents(mockIncidents);
      
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

  const calculateFare = useMemo(() => {
    return (): { amount: string; isShortTrip: boolean } => {
      const fromStation = stations.find(s => s.id === fromStationId);
      const toStation = stations.find(s => s.id === toStationId);
      
      if (!fromStation || !toStation) {
        return { amount: 'R9.00', isShortTrip: true };
      }

      const lineStations = stations.filter(s => s.line_id === fromStation.line_id);
      const fromIndex = lineStations.findIndex(s => s.id === fromStationId);
      const toIndex = lineStations.findIndex(s => s.id === toStationId);
      
      const distance = Math.abs(fromIndex - toIndex);
      
      if (distance <= 5) {
        return { amount: 'R9.00', isShortTrip: true };
      } else {
        return { amount: 'R14.00', isShortTrip: false };
      }
    };
  }, [stations, fromStationId, toStationId]);

  const handleFindTrains = async () => {
    const fromStation = stations.find(s => s.id === fromStationId);
    const toStation = stations.find(s => s.id === toStationId);
    
    if (!fromStation || !toStation) return;

    if (fromStation.line_id !== toStation.line_id) {
      setErrorMessage('Transfers are not supported yet. Please select stations on the same line.');
      setTrips(null);
      return;
    }

    const lineStations = stations.filter(s => s.line_id === fromStation.line_id);
    const fromIndex = lineStations.findIndex(s => s.id === fromStationId);
    const toIndex = lineStations.findIndex(s => s.id === toStationId);
    
    const travelDirection: Direction = fromIndex < toIndex ? 'outbound' : 'inbound';
    setDirection(travelDirection);

    setIsSearching(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('line_id', fromStation.line_id)
      .order('departure_time', { ascending: true });

    let tripsData: Trip[] = data || [];
    
    if (error || !data?.length) {
      console.log('Using mock trips');
      tripsData = mockTrips;
    }

    const now = new Date();
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const filteredTrips = (tripsData || []).filter(trip => {
      const tripTime = trip.departure_time.slice(0, 5);
      if (tripTime < currentTimeString) {
        return false;
      }

      if (travelDirection === 'outbound') {
        return trip.origin.toLowerCase().includes('cape town');
      } else {
        return trip.destination.toLowerCase().includes('cape town');
      }
    });
    
    setTrips(filteredTrips);
    setIsSearching(false);
  };

  const isValid = fromStationId && toStationId && fromStationId !== toStationId;

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

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

        {/* Search Card - Neobrutalism Style */}
        <div className="bg-card rounded-2xl p-6 border-2 border-foreground neo-shadow">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="ml-2 text-card-foreground">Loading stations...</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* From Station */}
              <div>
                <label className="text-sm font-semibold text-card-foreground/80 mb-2 block">
                  Origin
                </label>
                <Select value={fromStationId} onValueChange={handleFromChange}>
                  <SelectTrigger className="w-full h-14 bg-cream border-2 border-foreground text-foreground font-medium text-base rounded-xl neo-shadow-sm">
                    <SelectValue placeholder="Select departure station" />
                  </SelectTrigger>
                  <SelectContent className="bg-cream border-2 border-foreground z-50">
                    {stations.map(station => (
                      <SelectItem 
                        key={station.id} 
                        value={station.id}
                        disabled={station.id === toStationId}
                        className="text-foreground hover:bg-primary/20 font-medium"
                      >
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To Station */}
              <div>
                <label className="text-sm font-semibold text-card-foreground/80 mb-2 block">
                  Destination
                </label>
                <Select value={toStationId} onValueChange={handleToChange}>
                  <SelectTrigger className="w-full h-14 bg-cream border-2 border-foreground text-foreground font-medium text-base rounded-xl neo-shadow-sm">
                    <SelectValue placeholder="Select arrival station" />
                  </SelectTrigger>
                  <SelectContent className="bg-cream border-2 border-foreground z-50">
                    {stations.map(station => (
                      <SelectItem 
                        key={station.id} 
                        value={station.id}
                        disabled={station.id === fromStationId}
                        className="text-foreground hover:bg-primary/20 font-medium"
                      >
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Find Trains Button */}
              <Button 
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-foreground rounded-xl neo-shadow transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                onClick={handleFindTrains}
                disabled={!isValid || isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Find Trains'
                )}
              </Button>

              {errorMessage && (
                <p className="text-destructive text-sm text-center font-medium">{errorMessage}</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Updates Ticker */}
        {incidents.length > 0 && !trips && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Recent Updates
            </h3>
            <div className="space-y-2">
              {incidents.slice(0, 2).map(incident => (
                <div 
                  key={incident.id}
                  className="bg-card rounded-xl p-3 border-2 border-foreground flex items-start gap-3"
                >
                  <span className="text-lg">{incident.type === 'Delay' ? '⚠️' : '❌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground font-medium truncate">
                      {incident.description}
                    </p>
                    <p className="text-xs text-card-foreground/60 mt-1">
                      {formatTimeAgo(incident.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        {trips !== null && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Available Trains</h3>
            {trips.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center bg-card rounded-2xl border-2 border-foreground">
                <Moon className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-card-foreground font-bold">No more trains scheduled for today.</p>
                <p className="text-sm text-card-foreground/70 mt-1">Check the schedule for tomorrow morning.</p>
              </div>
            ) : (
              trips.map((trip, index) => {
                const fare = calculateFare();
                return (
                  <div
                    key={trip.id}
                    className="bg-card rounded-2xl p-4 flex items-center justify-between border-2 border-foreground neo-shadow-sm animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-extrabold text-primary">
                          {trip.departure_time.slice(0, 5)}
                        </p>
                        {direction === 'inbound' && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-charcoal text-cream border border-foreground">
                            INBOUND
                          </span>
                        )}
                        {direction === 'outbound' && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-sage text-charcoal-dark border border-foreground">
                            OUTBOUND
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-card-foreground/80 font-medium mt-1">
                        Train to {trip.destination}
                      </p>
                    </div>
                    <div className="text-right">
                      <p 
                        className={`text-xl font-extrabold ${fare.isShortTrip ? 'text-sage-dark' : 'text-warning'}`}
                      >
                        {fare.amount}
                      </p>
                      <p className="text-xs text-card-foreground/60 font-medium">Est. Fare</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;