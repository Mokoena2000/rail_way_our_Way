import { ChevronRight, Train } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Line } from '@/types/railway';
import { Card, CardContent } from '@/components/ui/card';

interface LineCardProps {
  line: Line;
  index: number;
}

export function LineCard({ line, index }: LineCardProps) {
  return (
    <Link to={`/line/${line.id}`}>
      <Card 
        className="group overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 border-border bg-card animate-fade-in"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ backgroundColor: line.color_code }}
          >
            <Train className="w-6 h-6 text-background" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{line.name}</h3>
            <p className="text-sm text-muted-foreground">Tap to view schedule</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </CardContent>
      </Card>
    </Link>
  );
}
