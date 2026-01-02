import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, description, icon, trend, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:shadow-elevated',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-card-foreground">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-sm font-medium',
                trend.positive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.positive ? '+' : ''}{trend.value}% em relação ao mês anterior
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
