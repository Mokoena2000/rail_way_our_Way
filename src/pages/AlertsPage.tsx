import { useRecentAlerts } from '@/hooks/useRailwayData';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AlertsPage = () => {
  const { data: alerts, isLoading } = useRecentAlerts();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="Live Alerts" 
        subtitle="Recent reports from commuters"
      />
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Showing reports from the last 2 hours
          </p>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert: any, index: number) => (
              <Card 
                key={alert.id} 
                className="border-border bg-card animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {alert.trips?.lines?.name || 'Unknown Line'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {alert.trips?.departure_time?.slice(0, 5)} • {alert.trips?.origin} → {alert.trips?.destination}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <StatusBadge status={alert.status} size="sm" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">No recent alerts</p>
            <p className="text-muted-foreground text-sm mt-1">
              All trains running normally
            </p>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default AlertsPage;
