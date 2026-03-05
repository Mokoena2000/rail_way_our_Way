import { AlertTriangle, CheckCircle } from 'lucide-react';
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

  const delayCount = alerts?.filter(a => a.type === 'Delay').length || 0;
  const cancelCount = alerts?.filter(a => a.type === 'Cancellation').length || 0;
  const hasIssues = delayCount > 0 || cancelCount > 0;

  return (
    <Link to="/community" className="block">
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
                ? `${delayCount} delays, ${cancelCount} cancellations`
                : `${alerts?.length || 0} reports — no major issues`
              }
            </p>
          </div>
          <div className="text-muted-foreground">→</div>
        </div>
      </div>
    </Link>
  );
}
