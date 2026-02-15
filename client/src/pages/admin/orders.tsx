import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus, useDismissOrderAlert } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ChevronDown, ChevronUp, Package, User, AlertTriangle, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMaghrebDate } from "@/lib/queryClient";
import { useState, useMemo } from "react";
import { useSearch, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const ALERT_DAYS = 15;

function getOrderAlertInfo(order: any) {
  if (!order.items || order.items.length === 0) return null;
  if (order.alertDismissed) return null;
  if (order.status === 'shipped' || order.status === 'received' || order.status === 'rejected' || order.status === 'submitted') return null;

  const now = new Date();
  const alerts: { type: 'incomplete' | 'exceeded'; itemName: string; completed: number; requested: number }[] = [];

  for (const item of order.items) {
    if (item.completedQuantity === item.quantity) continue;
    const referenceDate = item.lastCompletedUpdate
      ? new Date(item.lastCompletedUpdate)
      : (order.createdAt ? new Date(order.createdAt) : null);
    if (!referenceDate) continue;
    const daysSince = (now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= ALERT_DAYS) {
      if (item.completedQuantity < item.quantity) {
        alerts.push({ type: 'incomplete', itemName: item.product?.name || '', completed: item.completedQuantity, requested: item.quantity });
      } else if (item.completedQuantity > item.quantity) {
        alerts.push({ type: 'exceeded', itemName: item.product?.name || '', completed: item.completedQuantity, requested: item.quantity });
      }
    }
  }
  return alerts.length > 0 ? alerts : null;
}

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const dismissAlert = useDismissOrderAlert();
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const searchParams = new URLSearchParams(searchString);
  const filterParam = searchParams.get('filter');
  const [activeFilter, setActiveFilter] = useState<string>(filterParam || 'all');

  const alertCount = useMemo(() => {
    if (!orders) return 0;
    return orders.filter((o: any) => getOrderAlertInfo(o) !== null).length;
  }, [orders]);
  
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    switch (activeFilter) {
      case 'pending': return orders.filter((o: any) => o.status === 'submitted');
      case 'in_progress': return orders.filter((o: any) => o.status === 'accepted' || o.status === 'in_progress');
      case 'completed': return orders.filter((o: any) => o.status === 'completed');
      case 'shipped': return orders.filter((o: any) => o.status === 'shipped');
      case 'received': return orders.filter((o: any) => o.status === 'received');
      case 'rejected': return orders.filter((o: any) => o.status === 'rejected');
      case 'alerts': return orders.filter((o: any) => getOrderAlertInfo(o) !== null);
      default: return orders;
    }
  }, [orders, activeFilter]);
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setLocation('/admin/orders');
    } else {
      setLocation(`/admin/orders?filter=${filter}`);
    }
  };

  const handleDismissAlert = async (orderId: number) => {
    try {
      await dismissAlert.mutateAsync(orderId);
      toast({ title: "تم الإبطال", description: "تم إبطال الإنذار بنجاح" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const toggleOrder = (orderId: number) => {
    setExpandedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-teal-100 text-teal-800';
      default: return 'bg-amber-100 text-orange-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'accepted': return 'مقبول';
      case 'rejected': return 'مرفوض';
      case 'in_progress': return 'قيد الإنجاز';
      case 'completed': return 'منجز';
      case 'shipped': return 'تم الشحن';
      case 'received': return 'تم الاستلام';
      default: return 'في الانتظار';
    }
  };

  const getUnitLabel = (unit: string) => {
    return unit === 'bag' ? 'شكارة 25 كغ' : 'قطعة';
  };

  const renderAlertBanner = (alerts: any[]) => (
    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <p className="font-bold text-red-800 text-xs">تنبيه: مشاكل في الإنجاز</p>
          {alerts.map((alert, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-1 text-xs">
              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${alert.type === 'incomplete' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                {alert.type === 'incomplete' ? 'غير مكتمل' : 'تجاوز'}
              </Badge>
              <span className="text-red-700">
                <span className="font-medium">{alert.itemName}</span> — {alert.completed}/{alert.requested}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-red-500">مر أكثر من {ALERT_DAYS} يوم منذ آخر تحديث</p>
        </div>
      </div>
    </div>
  );

  const getItemStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-amber-100 text-orange-800';
    }
  };

  const getItemStatusLabel = (status: string) => {
    switch(status) {
      case 'accepted': return 'مقبول';
      case 'in_progress': return 'قيد الإنجاز';
      case 'completed': return 'تم الإنجاز';
      case 'rejected': return 'مرفوض';
      default: return 'في الانتظار';
    }
  };

  const renderOrderItems = (order: any) => (
    <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
      <p className="font-bold text-sm">تفاصيل الطلب:</p>
      <div className="grid gap-2">
        {order.items.map((item: any, idx: number) => {
          const itemSt = item.itemStatus || 'pending';
          const itemRefDate = item.lastCompletedUpdate ? new Date(item.lastCompletedUpdate) : (order.createdAt ? new Date(order.createdAt) : null);
          const itemHasIssue = itemRefDate && 
            ((new Date().getTime() - itemRefDate.getTime()) / (1000 * 60 * 60 * 24) >= ALERT_DAYS) &&
            item.completedQuantity !== item.quantity && !order.alertDismissed;

          return (
            <div key={idx} className={`p-2 rounded-lg border ${itemHasIssue ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm break-words">{item.product?.name}</p>
                  <p className="text-[10px] text-slate-400">{item.product?.sku}</p>
                  <Badge variant="secondary" className={`text-[10px] mt-1 ${getItemStatusColor(itemSt)}`}>
                    {getItemStatusLabel(itemSt)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={item.unit === 'bag' ? 'default' : 'outline'} className="text-[10px]">
                    {getUnitLabel(item.unit || 'piece')}
                  </Badge>
                  <div className="text-left">
                    <span className={`font-bold ${itemHasIssue ? 'text-red-600' : 'text-primary'}`}>{item.completedQuantity || 0}</span>
                    <span className="text-xs text-slate-400 mr-1">/ {item.quantity}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMobileCards = () => (
    <div className="lg:hidden space-y-3">
      {filteredOrders?.map((order: any) => {
        const alerts = getOrderAlertInfo(order);
        const hasAlert = alerts !== null;

        return (
          <Card key={order.id} className={hasAlert ? 'border-red-200' : ''} data-testid={`card-order-${order.id}`}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {hasAlert && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  <span className="font-mono font-bold text-lg" data-testid={`text-order-id-${order.id}`}>#{order.id}</span>
                </div>
                <Badge variant="secondary" className={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-bold text-slate-700" data-testid={`text-sales-point-${order.id}`}>
                  {order.salesPoint?.salesPointName || order.salesPoint?.firstName}
                </span>
                <span className="text-xs text-slate-400">
                  {order.createdAt && formatMaghrebDate(order.createdAt)}
                </span>
              </div>

              {order.statusChanger?.firstName && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="h-3 w-3" />
                  <span>تغيير: {order.statusChanger.firstName}</span>
                  {order.statusChangedAt && (
                    <span className="text-slate-400">({formatMaghrebDate(order.statusChangedAt)})</span>
                  )}
                </div>
              )}

              {hasAlert && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm" variant="outline"
                    className="border-red-300 text-red-600 gap-1 text-xs"
                    onClick={() => handleDismissAlert(order.id)}
                    disabled={dismissAlert.isPending}
                    data-testid={`button-dismiss-alert-${order.id}`}
                  >
                    <BellOff className="h-3 w-3" />
                    إبطال الإنذار
                  </Button>
                </div>
              )}

              {hasAlert && renderAlertBanner(alerts)}

              {order.items && order.items.length > 0 && renderOrderItems(order)}
            </CardContent>
          </Card>
        );
      })}
      {filteredOrders?.length === 0 && (
        <div className="text-center py-12 text-slate-400">لا توجد طلبات بعد</div>
      )}
    </div>
  );

  const renderDesktopTable = () => (
    <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
      <div className="min-w-[800px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>نقطة البيع</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>المنتجات</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تغيير بواسطة</TableHead>
              <TableHead>إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders?.map((order: any) => {
              const alerts = getOrderAlertInfo(order);
              const hasAlert = alerts !== null;

              return (
                <>
                  <TableRow key={order.id} className={hasAlert ? 'alert-glow-row' : ''}>
                    <TableCell className="font-mono font-bold" data-testid={`text-order-id-${order.id}`}>
                      <div className="flex items-center gap-2">
                        {hasAlert && <AlertTriangle className="h-5 w-5 text-red-500 alert-pulse-badge" />}
                        #{order.id}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold" data-testid={`text-sales-point-${order.id}`}>
                      {order.salesPoint?.salesPointName || order.salesPoint?.firstName}
                    </TableCell>
                    <TableCell>
                      {order.createdAt && formatMaghrebDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" size="sm" className="gap-2"
                        onClick={() => toggleOrder(order.id)}
                        data-testid={`button-toggle-order-${order.id}`}
                      >
                        <Package className="h-4 w-4" />
                        {order.items?.length || 0} صنف
                        {expandedOrders.includes(order.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-changed-by-${order.id}`}>
                      {order.statusChanger?.firstName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{order.statusChanger.firstName}</p>
                            {order.statusChangedAt && (
                              <p className="text-xs text-slate-400">{formatMaghrebDate(order.statusChangedAt)}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasAlert && (
                        <Button
                          size="sm" variant="outline"
                          className="border-red-300 text-red-600 gap-1"
                          onClick={() => handleDismissAlert(order.id)}
                          disabled={dismissAlert.isPending}
                          data-testid={`button-dismiss-alert-${order.id}`}
                        >
                          <BellOff className="h-4 w-4" />
                          إبطال
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {hasAlert && (
                    <TableRow key={`${order.id}-alert`}>
                      <TableCell colSpan={7} className="p-0">
                        <div className="bg-red-50 border-b-2 border-red-200 px-4 py-3">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 space-y-1">
                              <p className="font-bold text-red-800 text-sm">تنبيه: مشاكل في الإنجاز</p>
                              {alerts.map((alert, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <Badge variant="secondary" className={alert.type === 'incomplete' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}>
                                    {alert.type === 'incomplete' ? 'غير مكتمل' : 'تجاوز الكمية'}
                                  </Badge>
                                  <span className="text-red-700">
                                    <span className="font-medium">{alert.itemName}</span> — منجز: <span className="font-bold">{alert.completed}</span> / مطلوب: <span className="font-bold">{alert.requested}</span>
                                  </span>
                                </div>
                              ))}
                              <p className="text-xs text-red-500 mt-1">مر أكثر من {ALERT_DAYS} يوم منذ آخر تحديث</p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {expandedOrders.includes(order.id) && order.items && order.items.length > 0 && (
                    <TableRow key={`${order.id}-details`}>
                      <TableCell colSpan={7} className="bg-slate-50 p-4">
                        <div className="space-y-2">
                          <p className="font-bold text-sm mb-3">تفاصيل الطلب:</p>
                          <div className="grid gap-2">
                            {order.items.map((item: any, idx: number) => {
                              const itemSt2 = item.itemStatus || 'pending';
                              const itemRefDate = item.lastCompletedUpdate ? new Date(item.lastCompletedUpdate) : (order.createdAt ? new Date(order.createdAt) : null);
                              const itemHasIssue = itemRefDate && 
                                ((new Date().getTime() - itemRefDate.getTime()) / (1000 * 60 * 60 * 24) >= ALERT_DAYS) &&
                                item.completedQuantity !== item.quantity && !order.alertDismissed;
                              return (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border gap-4 ${itemHasIssue ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                                  <div className="flex-1">
                                    <p className="font-medium">{item.product?.name}</p>
                                    <p className="text-xs text-slate-400">{item.product?.sku}</p>
                                    <Badge variant="secondary" className={`text-[10px] mt-1 ${getItemStatusColor(itemSt2)}`}>
                                      {getItemStatusLabel(itemSt2)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <Badge variant={item.unit === 'bag' ? 'default' : 'outline'}>
                                      {getUnitLabel(item.unit || 'piece')}
                                    </Badge>
                                    <div className="text-left">
                                      <span className={`font-bold text-lg ${itemHasIssue ? 'text-red-600' : 'text-primary'}`}>{item.completedQuantity || 0}</span>
                                      <span className="text-xs text-slate-400 mr-1">/ {item.quantity}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
            {filteredOrders?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">لا توجد طلبات بعد</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="admin" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900" data-testid="text-page-title">سجل الطلبات</h1>
            <p className="text-slate-500">متابعة وتحديث حالات طلبات الفروع</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'الكل', count: orders?.length || 0 },
              { key: 'pending', label: 'في الانتظار', count: orders?.filter((o: any) => o.status === 'submitted').length || 0 },
              { key: 'in_progress', label: 'قيد العمل', count: orders?.filter((o: any) => o.status === 'accepted' || o.status === 'in_progress').length || 0 },
              { key: 'completed', label: 'منجز', count: orders?.filter((o: any) => o.status === 'completed').length || 0 },
              { key: 'shipped', label: 'تم الشحن', count: orders?.filter((o: any) => o.status === 'shipped').length || 0 },
              { key: 'received', label: 'تم الاستلام', count: orders?.filter((o: any) => o.status === 'received').length || 0 },
              { key: 'rejected', label: 'مرفوض', count: orders?.filter((o: any) => o.status === 'rejected').length || 0 },
            ].map(f => (
              <Button 
                key={f.key}
                variant={activeFilter === f.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(f.key)}
                data-testid={`filter-${f.key}`}
              >
                {f.label} ({f.count})
              </Button>
            ))}
            {alertCount > 0 && (
              <Button
                variant={activeFilter === 'alerts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('alerts')}
                className={activeFilter !== 'alerts' ? 'border-red-300 text-red-600' : 'bg-red-600'}
                data-testid="filter-alerts"
              >
                <AlertTriangle className="h-4 w-4 ml-1" />
                إنذارات ({alertCount})
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <>
              {renderMobileCards()}
              {renderDesktopTable()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
