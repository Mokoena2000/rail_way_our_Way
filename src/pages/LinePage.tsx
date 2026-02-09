import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLines, useTripsWithStatus } from '@/hooks/useRailwayData';
import { TrainCard } from '@/components/TrainCard';
import { ReportModal } from '@/components/ReportModal';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { TripWithStatus } from '@/types/railway';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LinePage = () => {
  const { lineId } = useParams<{ lineId: string }>();
  const { data: lines } = useLines();
  const { data: trips, isLoading, refetch, isFetching } = useTripsWithStatus(lineId || null);
  const [selectedTrip, setSelectedTrip] = useState<TripWithStatus | null>(null);
  
  const line = lines?.find(l => l.id === lineId);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title={line?.name || 'Schedule'} 
        subtitle="Upcoming departures"
        showBack
        color={line?.color_code}
      />
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Today's Trains</h2>
            <p className="text-sm text-muted-foreground">
              Status updates from the last 2 hours
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="space-y-3">
            {trips.map((trip, index) => (
              <TrainCard 
                key={trip.id} 
                trip={trip} 
                onClick={() => setSelectedTrip(trip)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No trains scheduled</p>
          </div>
        )}
      </main>
      
      <ReportModal 
        trip={selectedTrip}
        open={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
      />
      
      <BottomNav />
    </div>
  );
};

export default LinePage;
