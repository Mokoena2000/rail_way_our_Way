import { cn } from '@/lib/utils';
import { TripStatus } from '@/types/railway';

interface StatusBadgeProps {
  status: TripStatus;
  reportCount?: number;
  size?: 'sm' | 'md';
}

const statusConfig: Record<TripStatus, { label: string; className: string }> = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-muted text-muted-foreground',
  },
  on_time: {
    label: 'On Time',
    className: 'bg-success text-success-foreground',
  },
  delayed: {
    label: 'Delayed',
    className: 'bg-destructive text-destructive-foreground animate-pulse',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/80 text-destructive-foreground',
  },
};

export function StatusBadge({ status, reportCount, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-full",
          config.className,
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        )}
      >
        {config.label}
      </span>
      {reportCount !== undefined && reportCount > 0 && (
        <span className="text-xs text-muted-foreground">
          ({reportCount} {reportCount === 1 ? 'report' : 'reports'})
        </span>
      )}
    </div>
  );
}
