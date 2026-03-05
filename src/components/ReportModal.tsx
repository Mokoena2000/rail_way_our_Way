import { TripWithStatus } from '@/types/railway';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

interface ReportModalProps {
  trip: TripWithStatus | null;
  open: boolean;
  onClose: () => void;
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
}

export function ReportModal({ trip, open, onClose }: ReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleReport = async (status: string) => {
    if (!trip) return;
    setIsSubmitting(true);
    // This modal is legacy from the trip-based system — kept for compatibility
    toast.info('Please use the Community tab to report incidents.');
    setIsSubmitting(false);
    onClose();
  };
  
  if (!trip) return null;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-foreground">
            Report Train Status
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-4 border-b border-border">
          <p className="text-3xl font-bold text-primary mb-1">
            {formatTime(trip.departure_time)}
          </p>
          <p className="text-muted-foreground">
            {trip.origin} → {trip.destination}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 py-4">
          <Button size="lg" className="h-16 text-lg font-bold" onClick={() => handleReport('on_time')} disabled={isSubmitting}>
            ✅ On Time
          </Button>
          <Button size="lg" variant="secondary" className="h-16 text-lg font-bold" onClick={() => handleReport('delayed')} disabled={isSubmitting}>
            ⚠️ Delayed
          </Button>
          <Button size="lg" variant="destructive" className="h-16 text-lg font-bold" onClick={() => handleReport('cancelled')} disabled={isSubmitting}>
            ❌ Cancelled
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
