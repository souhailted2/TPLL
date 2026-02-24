import { Sidebar } from "@/components/layout-sidebar";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Activity, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

interface IntegrationEvent {
  id: number;
  eventType: string;
  source: string;
  payload: any;
  status: string;
  idempotencyKey: string | null;
  retryCount: number;
  error: string | null;
  processedAt: string | null;
  createdAt: string;
}

interface IntegrationStats {
  total: number;
  pending: number;
  processing: number;
  processed: number;
  failed: number;
  byType: Record<string, number>;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  processing: { label: "قيد المعالجة", color: "bg-blue-100 text-blue-800 border-blue-200", icon: RefreshCw },
  processed: { label: "تم", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  failed: { label: "فشل", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  skipped: { label: "تم تخطيه", color: "bg-gray-100 text-gray-800 border-gray-200", icon: AlertTriangle },
};

const eventTypeLabels: Record<string, string> = {
  ORDER_CREATED: "طلب جديد",
  PART_RECEIVED: "استلام قطعة",
  PART_USED: "استخدام قطعة",
  PURCHASE_CREATED: "عملية شراء",
  CONTAINER_ARRIVED: "وصول حاوية",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IntegrationMonitor() {
  const { data: health, isLoading: healthLoading } = useQuery<{ status: string; uptime?: number }>({
    queryKey: ["/api/integration/health"],
    refetchInterval: 10000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<IntegrationStats>({
    queryKey: ["/api/integration/stats"],
    refetchInterval: 15000,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery<{ events: IntegrationEvent[]; count: number }>({
    queryKey: ["/api/integration/events"],
    refetchInterval: 10000,
  });

  const events = eventsData?.events;

  const isOnline = health?.status === "ok";

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/integration/health"] });
    queryClient.invalidateQueries({ queryKey: ["/api/integration/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/integration/events"] });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 md:mr-64 pt-20 md:pt-0">
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">مراقبة خدمة التكامل</h1>
              <p className="text-slate-500 mt-1">متابعة الأحداث بين الأنظمة</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} data-testid="status-service-health">
                {healthLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isOnline ? (
                  <><Wifi className="h-4 w-4" /> متصلة</>
                ) : (
                  <><WifiOff className="h-4 w-4" /> غير متصلة</>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} data-testid="button-refresh">
                <RefreshCw className="h-4 w-4 ml-1" /> تحديث
              </Button>
            </div>
          </div>

          {statsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card data-testid="stat-total">
                <CardContent className="p-4 text-center">
                  <Activity className="h-6 w-6 mx-auto text-slate-500 mb-1" />
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-slate-500">إجمالي الأحداث</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-processed">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-6 w-6 mx-auto text-green-500 mb-1" />
                  <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
                  <p className="text-xs text-slate-500">تمت معالجتها</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-pending">
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-slate-500">قيد الانتظار</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-processing">
                <CardContent className="p-4 text-center">
                  <RefreshCw className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                  <p className="text-xs text-slate-500">قيد المعالجة</p>
                </CardContent>
              </Card>
              <Card data-testid="stat-failed">
                <CardContent className="p-4 text-center">
                  <XCircle className="h-6 w-6 mx-auto text-red-500 mb-1" />
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                  <p className="text-xs text-slate-500">فشلت</p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {stats && Object.keys(stats.byType).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الأحداث حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border" data-testid={`stat-type-${type}`}>
                      <span className="text-sm font-medium">{eventTypeLabels[type] || type}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">آخر الأحداث</CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !events || events.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">لا توجد أحداث بعد</p>
                  <p className="text-sm mt-1">ستظهر الأحداث هنا عند إنشاء طلب من نقطة بيع</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => {
                    const config = statusConfig[event.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <div key={event.id} className="flex items-start gap-3 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow" data-testid={`event-row-${event.id}`}>
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{eventTypeLabels[event.eventType] || event.eventType}</span>
                            <Badge variant="outline" className="text-xs">{event.source}</Badge>
                            <Badge className={`text-xs ${config.color} border`}>{config.label}</Badge>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {event.createdAt && formatDate(event.createdAt)}
                            {event.payload?.orderId && ` | طلب #${event.payload.orderId}`}
                            {event.payload?.salesPointName && ` | ${event.payload.salesPointName}`}
                            {event.retryCount > 0 && ` | محاولات: ${event.retryCount}`}
                          </div>
                          {event.error && (
                            <p className="text-xs text-red-500 mt-1">{event.error}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
