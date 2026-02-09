import { Home, List, Users, Menu, LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: List, label: 'Schedule', path: '/schedule' },
  { icon: Users, label: 'Community', path: '/community' },
  { icon: Menu, label: 'More', path: '/more' },
];

export function BottomNav() {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-foreground safe-area-bottom bg-card">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path || 
            (path === '/schedule' && location.pathname.startsWith('/line/'));
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative",
                isActive 
                  ? "text-primary" 
                  : "text-card-foreground/70 hover:text-card-foreground"
              )}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 mb-1 transition-transform",
                  isActive && "scale-110"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                "text-xs font-semibold",
                isActive && "font-bold"
              )}>
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-8 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}