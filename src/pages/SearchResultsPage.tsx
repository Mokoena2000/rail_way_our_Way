import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, Wallet, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearchTrips } from '@/hooks/useSearchTrips';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { StatusBadge } from '@/components/StatusBadge';
import { ReportModal } from '@/components/ReportModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TripWithStatus } from '@/types/railway';
import { useState } from 'react';

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
}

// Calculate estimated arrival (add 45 mins for demo)
function calculateArrival(departureTime: string): string {
  const [hours, minutes] = departureTime.split(':').map(Number);
  const arrivalMinutes = minutes + 45;
  const arrivalHours = hours + Math.floor(arrivalMinutes / 60);
  const finalMinutes = arrivalMinutes % 60;
  return `${String(arrivalHours % 24).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const time = searchParams.get('time') || '';

  const [selectedTrip, setSelectedTrip] = useState<TripWithStatus | null>(null);

  const { data, isLoading, error } = useSearchTrips(
    from && to && time ? { fromStation: from, toStation: to, departureTime: time } : null
  );

  const isSameLine = data && !data.requiresTransfer;
  const fare = isSameLine ? 'R9.00' : 'R16.00';

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Search Results" 
        subtitle={`${from} → ${to}`}
      />
      
      <main className="container max-w-lg mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          New search
        </Link>

        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Departing after</span>
            <span className="font-semibold text-primary">{time}</span>
          </div>
          {data?.lineInfo && (
            <div className="flex items-center gap-2 mt-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: data.lineInfo.color_code }}
              />
              <span className="text-sm font-medium">{data.lineInfo.name}</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive font-medium">Failed to search trains</p>
            <p className="text-muted-foreground text-sm mt-1">Please try again</p>
          </div>
        ) : data?.requiresTransfer ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Wallet className="w-12 h-12 text-warning mx-auto mb-4" />
            <p className="text-foreground font-medium">Transfer Required</p>
            <p className="text-muted-foreground text-sm mt-1">
              These stations are on different lines.<br />
              Fare: R16.00 (with transfer)
            </p>
          </div>
        ) : data?.trips.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">No trains found</p>
            <p className="text-muted-foreground text-sm mt-1">
              No trains departing after {time} on this route
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.trips.map((trip) => (
              <div 
                key={trip.id}
                className="bg-card rounded-xl border border-border p-4 transition-all hover:border-primary/50"
              >
                {/* Time Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">
                      {formatTime(trip.departure_time)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-lg font-medium text-foreground">
                      {calculateArrival(trip.departure_time)}
                    </span>
                  </div>
                </div>

                {/* Route Info */}
                <p className="text-sm text-muted-foreground mb-3">
                  {trip.origin} → {trip.destination}
                </p>

                {/* Fare */}
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Estimated Fare: {fare}
                  </span>
                </div>

                {/* Status and Report Row */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={trip.status} />
                    {trip.reportCount > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {trip.reportCount} reports
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTrip(trip)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Report Status
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
      
      <ReportModal
        trip={selectedTrip}
        open={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
      />
    </div>
  );
}
