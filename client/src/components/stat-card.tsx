import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "wouter";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  color?: "blue" | "green" | "orange" | "purple";
  href?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  className,
  color = "blue",
  href
}: StatCardProps) {
  
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  const cardContent = (
    <div className={cn(
      "bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all",
      href && "cursor-pointer hover:scale-[1.02]",
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
      {href && (
        <div className="mt-3 text-xs text-primary font-medium">
          اضغط للتفاصيل ←
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}
