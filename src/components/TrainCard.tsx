import { Clock, MapPin } from 'lucide-react';
import { TripWithStatus } from '@/types/railway';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface TrainCardProps {
  trip: TripWithStatus;
  onClick: () => void;
  index: number;
}

function formatTime(timeString: string): string {
  // Handle HH:MM:SS format
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
}

export function TrainCard({ trip, onClick, index }: TrainCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 cursor-pointer",
        "hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/5",
        "active:scale-[0.99] border-border bg-card animate-fade-in"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-xl p-3">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                {formatTime(trip.departure_time)}
              </p>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="w-3 h-3" />
                <span>{trip.origin} → {trip.destination}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={trip.status} reportCount={trip.reportCount} />
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Tap to report status
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
