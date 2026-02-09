import { ThumbsUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Incident {
  id: string;
  type: 'Delay' | 'Cancelled' | 'Safety' | 'Overcrowded';
  title: string;
  description: string;
  station: string;
  created_at: string;
  upvotes: number;
}

interface IncidentCardProps {
  incident: Incident;
  index: number;
  onUpvote?: (id: string) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'Delay': return 'bg-warning'; // Yellow
    case 'Cancelled': return 'bg-destructive'; // Red
    case 'Safety': return 'bg-success'; // Green
    case 'Overcrowded': return 'bg-primary'; // Terracotta
    default: return 'bg-muted';
  }
}

function getTypeTitle(type: string, station: string): string {
  switch (type) {
    case 'Delay': return `Delay at ${station}`;
    case 'Cancelled': return `Cancelled at ${station}`;
    case 'Safety': return `Safety Alert at ${station}`;
    case 'Overcrowded': return `Overcrowded at ${station}`;
    default: return `Report at ${station}`;
  }
}

export function IncidentCard({ incident, index, onUpvote }: IncidentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-card rounded-2xl border-2 border-foreground p-4 neo-shadow-sm"
    >
      <div className="flex items-start gap-4">
        {/* Colored Circle Indicator */}
        <div className="flex-shrink-0 pt-1">
          <div className={`w-4 h-4 rounded-full ${getTypeColor(incident.type)} border-2 border-foreground`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Timestamp */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-foreground truncate">
              {getTypeTitle(incident.type, incident.station)}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(incident.created_at)}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-card-foreground/80 leading-relaxed">
            {incident.description}
          </p>
          
          {/* Footer with Upvote */}
          <div className="flex items-center justify-end mt-3">
            <button 
              onClick={() => onUpvote?.(incident.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{incident.upvotes}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export type { Incident };
