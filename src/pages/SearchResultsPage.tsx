import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Wallet, Users } from 'lucide-react';
import { useSearchTrips } from '@/hooks/useSearchTrips';
import { useRouteFare } from '@/hooks/useFares'; // Our new manual hook
import { useStations } from '@/hooks/useStations'; // To find the IDs
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { StatusBadge } from '@/components/StatusBadge';
import { ReportModal } from '@/components/ReportModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TripWithStatus } from '@/types/railway';
import { useState, useMemo } from 'react';

// ... formatTime and calculateArrival functions stay the same ...

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const fromName = searchParams.get('from') || '';
  const toName = searchParams.get('to') || '';
  const time = searchParams.get('time') || '';

  const [selectedTrip, setSelectedTrip] = useState<TripWithStatus | null>(null);

  // 1. Get all stations to find the IDs for the names in the URL
const { data: stations = [] } = useStations();  
  const { fromId, toId } = useMemo(() => {
    const fromStation = stations.find(s => s.name === fromName);
    const toStation = stations.find(s => s.name === toName);
    return { fromId: fromStation?.id || null, toId: toStation?.id || null };
  }, [stations, fromName, toName]);

  // 2. Fetch the REAL fare from your manual backend
  const { data: fareData, isLoading: fareLoading } = useRouteFare({ fromId, toId });

  // 3. Fetch the trips
  const { data, isLoading, error } = useSearchTrips(
    fromName && toName && time ? { fromStation: fromName, toStation: toName, departureTime: time } : null
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Search Results" 
        subtitle={`${fromName} → ${toName}`}
      />
      
      <main className="container max-w-lg mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          New search
        </Link>

        {/* Dynamic Fare Card */}
        {fareData && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-primary/60">Single Fare</p>
                <p className="text-xl font-black text-foreground">R{fareData.single_fare.toFixed(2)}</p>
              </div>
            </div>
            {fareData.monthly_fare && (
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Monthly Pass</p>
                <p className="text-sm font-bold text-foreground">R{fareData.monthly_fare.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}

        {/* ... Loading and Error states ... */}

        {!isLoading && !error && data?.trips.map((trip) => (
          <div key={trip.id} className="bg-card rounded-xl border border-border p-4 mb-3">
             {/* Time and Route info... */}
             
             {/* We can remove the "Estimated Fare" from each individual trip card 
                 now that we have the Master Fare Card at the top! */}
             
             <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                <StatusBadge status={trip.status} />
                <Button variant="outline" size="sm" onClick={() => setSelectedTrip(trip)}>
                  Report Status
                </Button>
             </div>
          </div>
        ))}
      </main>

      <BottomNav />
      <ReportModal trip={selectedTrip} open={!!selectedTrip} onClose={() => setSelectedTrip(null)} />
    </div>
  );
}