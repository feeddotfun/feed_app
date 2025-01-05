import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  valuePrefix?: string;
  emptyState?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon,
  trend,
  valuePrefix,
  emptyState = "No data" 
}: StatsCardProps) => {
  const isEmpty = value === 0 || value === "";

  return (
    <Card className={cn(
      "relative hover:shadow-md transition-all duration-300 bg-card",
      "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-b before:from-primary/5 before:to-transparent before:pointer-events-none",
      "after:absolute after:inset-0 after:rounded-lg after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] after:pointer-events-none",
      isEmpty && "opacity-80"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-4 w-4",
          isEmpty ? "text-muted-foreground" : "text-primary"
        )} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={cn(
            "text-2xl font-bold",
            isEmpty && "text-muted-foreground text-base"
          )}>
            {isEmpty ? (
              emptyState
            ) : (
              <>
                {valuePrefix}
                {typeof value === 'number' ? value.toLocaleString() : value}
              </>
            )}
          </div>
          {!isEmpty && trend && (
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className={cn(
                "text-xs",
                trend.isPositive ? "bg-primary/10 text-primary border-primary/20" : ""
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};