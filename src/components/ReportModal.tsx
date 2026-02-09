import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { TripWithStatus } from '@/types/railway';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSubmitReport, getReportCooldownStatus } from '@/hooks/useRailwayData';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

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
  const submitReport = useSubmitReport();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  
  // Check and update cooldown status
  useEffect(() => {
    if (!open) return;
    
    const updateCooldown = () => {
      const { allowed, remainingSeconds } = getReportCooldownStatus();
      setCooldownSeconds(allowed ? 0 : remainingSeconds);
    };
    
    // Initial check
    updateCooldown();
    
    // Update every second while modal is open
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [open]);
  
  const isRateLimited = cooldownSeconds > 0;
  
  const handleReport = async (status: 'on_time' | 'delayed' | 'cancelled') => {
    if (!trip || isRateLimited) return;
    
    setIsSubmitting(true);
    try {
      await submitReport.mutateAsync({ tripId: trip.id, status });
      toast.success('Report submitted!', {
        description: 'Thank you for helping fellow commuters.',
      });
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      toast.error('Failed to submit report', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
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
        
        {isRateLimited ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Clock className="w-12 h-12 text-muted-foreground" />
            <p className="text-lg font-semibold text-foreground">Please wait</p>
            <p className="text-muted-foreground text-center">
              You can submit another report in <span className="font-bold text-primary">{cooldownSeconds}</span> seconds
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-4">
            <Button
              size="lg"
              className="h-16 text-lg font-bold bg-success hover:bg-success/90 text-success-foreground"
              onClick={() => handleReport('on_time')}
              disabled={isSubmitting}
            >
              <CheckCircle className="w-6 h-6 mr-3" />
              On Time
            </Button>
            
            <Button
              size="lg"
              className="h-16 text-lg font-bold bg-warning hover:bg-warning/90 text-warning-foreground"
              onClick={() => handleReport('delayed')}
              disabled={isSubmitting}
            >
              <AlertTriangle className="w-6 h-6 mr-3" />
              Delayed
            </Button>
            
            <Button
              size="lg"
              className="h-16 text-lg font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => handleReport('cancelled')}
              disabled={isSubmitting}
            >
              <XCircle className="w-6 h-6 mr-3" />
              Cancelled
            </Button>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground text-center">
          {isRateLimited 
            ? 'Rate limiting helps prevent spam and keeps reports accurate' 
            : 'Your report helps fellow commuters plan their journey'}
        </p>
      </DialogContent>
    </Dialog>
  );
}
