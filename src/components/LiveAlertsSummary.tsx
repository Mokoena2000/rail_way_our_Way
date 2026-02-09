import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useRecentAlerts } from '@/hooks/useRailwayData';
import { Link } from 'react-router-dom';

export function LiveAlertsSummary() {
  const { data: alerts, isLoading } = useRecentAlerts();

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="animate-pulse h-12 bg-secondary rounded" />
      </div>
    );
  }

  // Group alerts by status
  const delayedCount = alerts?.filter(a => a.status === 'delayed').length || 0;
  const cancelledCount = alerts?.filter(a => a.status === 'cancelled').length || 0;
  const onTimeCount = alerts?.filter(a => a.status === 'on_time').length || 0;

  // Get unique lines with issues
  const linesWithIssues = new Set<string>();
  alerts?.forEach(alert => {
    if (alert.status === 'delayed' || alert.status === 'cancelled') {
      const lineName = (alert.trips as any)?.lines?.name;
      if (lineName) linesWithIssues.add(lineName);
    }
  });

  const hasIssues = delayedCount > 0 || cancelledCount > 0;

  return (
    <Link to="/alerts" className="block">
      <div className={`rounded-xl border p-4 transition-all ${
        hasIssues 
          ? 'bg-warning/10 border-warning/30' 
          : 'bg-success/10 border-success/30'
      }`}>
        <div className="flex items-center gap-3">
          {hasIssues ? (
            <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
          ) : (
            <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">
              {hasIssues ? 'Live Alerts' : 'All Clear'}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {hasIssues 
                ? `${delayedCount} delayed, ${cancelledCount} cancelled`
                : `${onTimeCount} trains reported on time`
              }
            </p>
            {linesWithIssues.size > 0 && (
              <p className="text-xs text-warning mt-1">
                ⚠️ {[...linesWithIssues].join(', ')}
              </p>
            )}
          </div>
          
          <div className="text-muted-foreground">
            →
          </div>
        </div>
      </div>
    </Link>
  );
}
