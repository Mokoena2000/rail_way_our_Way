import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';

interface DepartureCardProps {
  departureTime: string;
  destination: string;
  status?: 'on-time' | 'delayed' | 'cancelled';
  index?: number;
}

export function DepartureCard({ 
  departureTime, 
  destination, 
  status = 'on-time',
  index = 0 
}: DepartureCardProps) {
  const statusConfig = {
    'on-time': { label: 'On Time', className: 'bg-sage/20 text-sage-dark border-sage-dark' },
    'delayed': { label: 'Delayed', className: 'bg-warning/20 text-warning border-warning' },
    'cancelled': { label: 'Cancelled', className: 'bg-destructive/20 text-destructive border-destructive' },
  };

  const { label, className } = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="bg-card rounded-2xl p-4 border-2 border-foreground neo-shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-2xl font-extrabold text-primary tabular-nums">
              {departureTime}
            </span>
          </div>
          
          {/* Destination */}
          <div className="flex items-center gap-2 text-card-foreground">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">To {destination}</span>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${className}`}>
          {label}
        </span>
      </div>
    </motion.div>
  );
}
