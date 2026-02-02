import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  color?: "blue" | "green" | "orange" | "purple";
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  className,
  color = "blue" 
}: StatCardProps) {
  
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1 font-display">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-xl border", colorStyles[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs font-medium">
          <span className={cn(
            "mr-1",
            trendUp ? "text-emerald-600" : "text-red-600"
          )}>
            {trend}
          </span>
          <span className="text-muted-foreground">مقارنة بالشهر الماضي</span>
        </div>
      )}
    </div>
  );
}
