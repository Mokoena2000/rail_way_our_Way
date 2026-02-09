import { ChevronRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface StationCardProps {
  id: string;
  name: string;
  lineColor?: string;
  onClick: () => void;
  index?: number;
}

export function StationCard({ name, lineColor = '#E07A5F', onClick, index = 0 }: StationCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={onClick}
      className="w-full bg-card rounded-2xl p-4 border-2 border-foreground neo-shadow-sm 
                 flex items-center justify-between gap-3 text-left
                 hover:translate-x-1 hover:-translate-y-0.5 transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-foreground"
          style={{ backgroundColor: lineColor + '30' }}
        >
          <MapPin className="w-5 h-5" style={{ color: lineColor }} />
        </div>
        <span className="font-bold text-card-foreground">{name}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </motion.button>
  );
}
