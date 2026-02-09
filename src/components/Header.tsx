import { ArrowLeft, Train } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  color?: string;
}

export function Header({ title, subtitle, showBack, color }: HeaderProps) {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-40 bg-card border-b-2 border-foreground">
      <div className="container max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-card-foreground hover:text-primary"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          
          {!showBack && (
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-foreground"
              style={{ backgroundColor: color || 'hsl(var(--primary))' }}
            >
              <Train className="w-5 h-5 text-card" />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className={cn(
              "font-extrabold text-card-foreground",
              showBack ? "text-lg" : "text-xl"
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-card-foreground/70 font-medium">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}