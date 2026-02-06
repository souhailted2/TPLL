import { useState } from "react";
import { Bell, Check, CheckCheck, Package, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export function NotificationDropdown() {
  const { data: notifications, isLoading, isError, refetch } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar });
    } catch {
      return "";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-300 hover:text-white hover:bg-slate-700" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-slate-900 border shadow-lg">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>الإشعارات</span>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => refetch()}
              data-testid="button-refresh-notifications"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                data-testid="button-mark-all-read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isError ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>تعذر تحميل الإشعارات</p>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="h-4 w-4 ml-1" />
              إعادة المحاولة
            </Button>
          </div>
        ) : isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            جاري التحميل...
          </div>
        ) : notifications?.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            لا توجد إشعارات
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications?.slice(0, 20).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 cursor-pointer",
                  !notification.isRead && "bg-blue-50 dark:bg-blue-950"
                )}
                onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                data-testid={`notification-item-${notification.id}`}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className={cn(
                    "mt-0.5 p-1.5 rounded-full",
                    notification.type === "new_order" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {notification.type === "new_order" ? (
                      <Package className="h-4 w-4" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{notification.title}</span>
                      {!notification.isRead && (
                        <Badge variant="secondary" className="h-4 text-xs px-1">
                          جديد
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(notification.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
