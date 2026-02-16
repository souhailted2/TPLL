import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus, useDismissOrderAlert } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Package, User, AlertTriangle, BellOff } from "lucide-react";
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

function getItemStatusFilter(itemStatus: string): string {
  switch (itemStatus) {
    case 'pending':
    case 'accepted': return 'pending';
    case 'in_progress': return 'in_progress';
    case 'completed': return 'completed';
    case 'rejected': return 'rejected';
    default: return 'pending';
  }
}

function filterItemsByStatus(items: any[], filter: string): any[] {
  switch (filter) {
    case 'pending':
      return items.filter((i: any) => ['pending', 'accepted'].includes(i.itemStatus || 'pending'));
    case 'in_progress':
      return items.filter((i: any) => (i.itemStatus || 'pending') === 'in_progress');
    case 'completed':
      return items.filter((i: any) => (i.itemStatus || 'pending') === 'completed');
    case 'rejected':
      return items.filter((i: any) => (i.itemStatus || 'pending') === 'rejected');
    case 'received':
      return items.filter((i: any) => (i.itemStatus || 'pending') === 'received');
    default:
      return items;
  }
}

function countItemsByStatus(orders: any[], statusFilter: string): number {
  if (!orders) return 0;
  let count = 0;
  for (const order of orders) {
    if (!order.items) continue;
    count += filterItemsByStatus(order.items, statusFilter).length;
  }
  return count;
}

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const dismissAlert = useDismissOrderAlert();
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

  const isItemLevelFilter = ['in_progress', 'completed', 'rejected', 'received'].includes(activeFilter);

  const filteredData = useMemo(() => {
    if (!orders) return [];

    switch (activeFilter) {
      case 'pending': {
        const result: any[] = [];
        for (const order of orders) {
          if (['shipped', 'received', 'rejected'].includes(order.status)) continue;
          const filtered = filterItemsByStatus(order.items || [], 'pending');
          if (filtered.length > 0) {
            result.push({ ...order, _filteredItems: filtered });
          }
        }
        return result;
      }

      case 'in_progress': {
        const result: any[] = [];
        for (const order of orders) {
          if (['shipped', 'received', 'rejected', 'submitted'].includes(order.status)) continue;
          const filtered = filterItemsByStatus(order.items || [], 'in_progress');
          if (filtered.length > 0) {
            result.push({ ...order, _filteredItems: filtered });
          }
        }
        return result;
      }

      case 'completed': {
        const result: any[] = [];
        for (const order of orders) {
          if (['shipped', 'received', 'rejected', 'submitted'].includes(order.status)) continue;
          const filtered = filterItemsByStatus(order.items || [], 'completed');
          if (filtered.length > 0) {
            result.push({ ...order, _filteredItems: filtered });
          }
        }
        return result;
      }

      case 'shipped': {
        const result: any[] = [];
        for (const order of orders) {
          if (order.status === 'shipped') {
            result.push({ ...order });
            continue;
          }
          const shippedItems = (order.items || []).filter((i: any) => (i.shippedQuantity || 0) > 0);
          if (shippedItems.length > 0) {
            result.push({ ...order, _filteredItems: shippedItems });
          }
        }
        return result;
      }

      case 'received': {
        const result: any[] = [];
        for (const order of orders) {
          if (order.status === 'received') {
            result.push({ ...order });
            continue;
          }
          const receivedItems = filterItemsByStatus(order.items || [], 'received');
          if (receivedItems.length > 0) {
            result.push({ ...order, _filteredItems: receivedItems });
          }
        }
        return result;
      }

      case 'rejected': {
        const result: any[] = [];
        for (const order of orders) {
          const filtered = filterItemsByStatus(order.items || [], 'rejected');
          if (filtered.length > 0) {
            result.push({ ...order, _filteredItems: filtered });
          }
        }
        const rejectedOrders = orders.filter((o: any) => o.status === 'rejected' && !result.find(r => r.id === o.id));
        return [...result, ...rejectedOrders];
      }

      case 'alerts':
        return orders.filter((o: any) => getOrderAlertInfo(o) !== null).map((o: any) => ({ ...o }));

      default:
        return orders.map((o: any) => ({ ...o }));
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

  const getItemStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'received': return 'bg-teal-100 text-teal-800';
      default: return 'bg-amber-100 text-orange-800';
    }
  };

  const getItemStatusLabel = (status: string) => {
    switch(status) {
      case 'accepted': return 'مقبول';
      case 'in_progress': return 'قيد الإنجاز';
      case 'completed': return 'تم الإنجاز';
      case 'rejected': return 'مرفوض';
      case 'received': return 'تم الاستلام';
      default: return 'في الانتظار';
    }
  };

  const renderOrderCard = (order: any) => {
    const alerts = getOrderAlertInfo(order);
    const hasAlert = alerts !== null;
    const displayItems = order._filteredItems || order.items || [];

    return (
      <Card key={order.id} className={hasAlert ? 'border-red-200' : ''} data-testid={`card-order-${order.id}`}>
        <CardContent className="p-4 space-y-3">
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
            <>
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
            </>
          )}

          {displayItems.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-slate-500" />
                <p className="font-bold text-sm">{displayItems.length} أصناف</p>
              </div>
              <div className="grid gap-2">
                {displayItems.map((item: any, idx: number) => {
                  const itemSt = item.itemStatus || 'pending';
                  const itemRefDate = item.lastCompletedUpdate ? new Date(item.lastCompletedUpdate) : (order.createdAt ? new Date(order.createdAt) : null);
                  const itemHasIssue = itemRefDate && 
                    ((new Date().getTime() - itemRefDate.getTime()) / (1000 * 60 * 60 * 24) >= ALERT_DAYS) &&
                    item.completedQuantity !== item.quantity && !order.alertDismissed;

                  return (
                    <div key={idx} className={`p-3 rounded-lg border ${itemHasIssue ? 'bg-red-50 border-red-200' : 'bg-white'}`} data-testid={`item-card-${item.id}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm break-words">{item.product?.name}</p>
                          <p className="text-[10px] text-slate-400">{item.product?.sku}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className={`text-[10px] ${getItemStatusColor(itemSt)}`}>
                            {getItemStatusLabel(itemSt)}
                          </Badge>
                          <Badge variant={item.unit === 'bag' ? 'default' : 'outline'} className="text-[10px]">
                            {getUnitLabel(item.unit || 'piece')}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="text-slate-500">المطلوب: <span className="font-bold">{item.quantity}</span></span>
                          <span className="text-slate-500">المنجز: <span className={`font-bold ${itemHasIssue ? 'text-red-600' : 'text-green-700'}`}>{item.completedQuantity || 0}</span></span>
                          {(item.shippedQuantity || 0) > 0 && (
                            <span className="text-slate-500">المشحون: <span className="font-bold text-purple-700">{item.shippedQuantity}</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const inProgressItemCount = useMemo(() => countItemsByStatus(orders || [], 'in_progress'), [orders]);
  const completedItemCount = useMemo(() => countItemsByStatus(orders || [], 'completed'), [orders]);
  const rejectedItemCount = useMemo(() => countItemsByStatus(orders || [], 'rejected'), [orders]);
  const shippedItemCount = useMemo(() => {
    if (!orders) return 0;
    let count = 0;
    for (const order of orders) {
      if (order.status === 'shipped') { count++; continue; }
      const shippedItems = (order.items || []).filter((i: any) => (i.shippedQuantity || 0) > 0);
      if (shippedItems.length > 0) count += shippedItems.length;
    }
    return count;
  }, [orders]);

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
              { key: 'pending', label: 'في الانتظار', count: countItemsByStatus(orders || [], 'pending') },
              { key: 'in_progress', label: 'قيد العمل', count: inProgressItemCount },
              { key: 'completed', label: 'منجز', count: completedItemCount },
              { key: 'shipped', label: 'تم الشحن', count: shippedItemCount },
              { key: 'received', label: 'تم الاستلام', count: countItemsByStatus(orders || [], 'received') },
              { key: 'rejected', label: 'مرفوض', count: rejectedItemCount },
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
                تنبيهات ({alertCount})
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredData?.map((order: any) => renderOrderCard(order))}
              {filteredData?.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400">لا توجد طلبات بعد</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
