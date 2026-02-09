import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLines, useTripsWithStatus } from '@/hooks/useRailwayData';
import { useLineStations } from '@/hooks/useLineStations';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { MapPin, Train, ArrowRight, Clock, Coins } from 'lucide-react';

const LineDetailsPage = () => {
  const { lineId } = useParams<{ lineId: string }>();
  const { data: lines } = useLines();
  const { data: stations, isLoading: stationsLoading } = useLineStations(lineId || null);
  const { data: trips, isLoading: tripsLoading } = useTripsWithStatus(lineId || null);
  
  const [departure, setDeparture] = useState<string>('');
  const [arrival, setArrival] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  
  const line = lines?.find(l => l.id === lineId);
  const lineColor = line?.color_code || '#FFD700';

  const handleCheckStatus = () => {
    if (departure && arrival) {
      setShowResults(true);
    }
  };

  // Filter trips - for MVP, just show all trips on this line
  const filteredTrips = showResults ? trips : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title={line?.name || 'Line Details'} 
        subtitle="Stations & Trip Planner"
        showBack
        color={lineColor}
      />
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Trip Planner Section */}
        <Card className="border-2" style={{ borderColor: lineColor }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Train className="w-5 h-5" style={{ color: lineColor }} />
              Plan a trip on this line
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Departure Station</label>
                <Select value={departure} onValueChange={setDeparture}>
                  <SelectTrigger className="bg-muted">
                    <SelectValue placeholder="Select departure" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {stations?.map(station => (
                      <SelectItem key={station.id} value={station.name}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Arrival Station</label>
                <Select value={arrival} onValueChange={setArrival}>
                  <SelectTrigger className="bg-muted">
                    <SelectValue placeholder="Select arrival" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {stations?.filter(s => s.name !== departure).map(station => (
                      <SelectItem key={station.id} value={station.name}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              className="w-full text-background font-bold"
              style={{ backgroundColor: lineColor }}
              onClick={handleCheckStatus}
              disabled={!departure || !arrival}
            >
              Check Status & Fare
            </Button>
          </CardContent>
        </Card>

        {/* Trip Results */}
        {showResults && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">
                {departure} → {arrival}
              </h3>
              <div className="flex items-center gap-1 text-primary font-bold">
                <Coins className="w-4 h-4" />
                R9.00
              </div>
            </div>
            
            {tripsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredTrips && filteredTrips.length > 0 ? (
              filteredTrips.map((trip, index) => (
                <Card 
                  key={trip.id} 
                  className="border-border animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-bold text-lg text-foreground">
                            {trip.departure_time.slice(0, 5)}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {trip.destination}
                        </span>
                      </div>
                      <StatusBadge status={trip.status} />
                    </div>
                    {trip.reportCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {trip.reportCount} community report{trip.reportCount > 1 ? 's' : ''}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No scheduled trips found</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Station List */}
        <div>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" style={{ color: lineColor }} />
            Stations on this line
          </h3>
          
          {stationsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : stations && stations.length > 0 ? (
            <div className="relative">
              {/* Track line */}
              <div 
                className="absolute left-5 top-4 bottom-4 w-1 rounded-full"
                style={{ backgroundColor: lineColor }}
              />
              
              {/* Stations */}
              <div className="space-y-1">
                {stations.map((station, index) => (
                  <div 
                    key={station.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-card hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Station dot */}
                    <div 
                      className="w-4 h-4 rounded-full border-4 bg-background z-10"
                      style={{ borderColor: lineColor }}
                    />
                    <span className="text-foreground font-medium">{station.name}</span>
                    {index === 0 && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-auto">
                        Start
                      </span>
                    )}
                    {index === stations.length - 1 && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-auto">
                        End
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No stations found for this line</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default LineDetailsPage;
