import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus, useUpdateCompletedQuantity } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ShippingOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const updateCompleted = useUpdateCompletedQuantity();
  const [activeFilter, setActiveFilter] = useState<string>('ready');
  const [completedQuantities, setCompletedQuantities] = useState<Record<number, number>>({});
  const { toast } = useToast();

  const hasCompletedItems = (order: any) => {
    return order.items?.some((item: any) => (item.completedQuantity || 0) > 0);
  };

  const hasAcceptedOrCompletedItems = (order: any) => {
    return order.items?.some((item: any) => ['accepted', 'in_progress', 'completed'].includes(item.itemStatus || 'pending'));
  };

  const readyOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o: any) =>
      o.status === 'completed' ||
      ((o.status === 'in_progress' || o.status === 'accepted') && (hasCompletedItems(o) || hasAcceptedOrCompletedItems(o)))
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    switch (activeFilter) {
      case 'ready': return readyOrders;
      case 'shipped': return orders.filter((o: any) => o.status === 'shipped');
      case 'received': return orders.filter((o: any) => o.status === 'received');
      default: return [...readyOrders, ...orders.filter((o: any) => ['shipped', 'received'].includes(o.status))];
    }
  }, [orders, activeFilter, readyOrders]);

  const handleShip = async (orderId: number) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: 'shipped' });
      toast({ title: "تم الشحن", description: `تم شحن الطلب #${orderId}` });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleCompletedQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateCompleted.mutateAsync({ itemId, completedQuantity: quantity });
      toast({ title: "تم التحديث", description: "تم تحديث الكمية المستلمة" });
      setCompletedQuantities(prev => ({ ...prev, [itemId]: 0 }));
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'in_progress':
      case 'accepted': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-teal-100 text-teal-800';
      default: return 'bg-amber-100 text-orange-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'in_progress':
      case 'accepted': return 'جزئياً جاهز للشحن';
      case 'completed': return 'جاهز للشحن';
      case 'shipped': return 'تم الشحن';
      case 'received': return 'تم الاستلام';
      default: return status;
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

  const getItemStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-amber-100 text-orange-800';
    }
  };

  const getUnitLabel = (unit: string) => {
    return unit === 'bag' ? 'شكارة 25 كغ' : 'قطعة';
  };

  const renderOrderItems = (order: any) => {
    const items = order.items || [];
    const acceptedItems = items.filter((item: any) => ['accepted', 'in_progress', 'completed'].includes(item.itemStatus || 'pending'));
    const isShippedOrReceived = order.status === 'shipped' || order.status === 'received';

    return (
      <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-4 w-4 text-slate-500" />
          <p className="font-bold text-sm">{items.length} أصناف</p>
        </div>
        <div className="grid gap-2">
          {items.map((item: any, idx: number) => {
            const itemSt = item.itemStatus || 'pending';
            const isAccepted = ['accepted', 'in_progress', 'completed'].includes(itemSt);
            const maxAllowed = Math.ceil(item.quantity * 1.5);
            const currentCompleted = item.completedQuantity || 0;

            return (
              <div key={idx} className={`p-3 rounded-lg border ${isAccepted ? 'bg-white' : 'bg-slate-50 border-slate-200 opacity-60'}`} data-testid={`item-card-${item.id}`}>
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
                    <span className="font-bold text-primary">{item.quantity}</span>
                  </div>
                </div>

                {isAccepted && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">المستلم: <span className="font-bold text-green-700">{currentCompleted}</span> / {item.quantity}</span>
                      <span className="text-[10px] text-slate-400">(حد أقصى: {maxAllowed})</span>
                    </div>
                    {!isShippedOrReceived && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500 shrink-0">كمية مستلمة:</span>
                        <Input
                          type="number"
                          min={0}
                          max={maxAllowed}
                          value={completedQuantities[item.id] !== undefined ? (completedQuantities[item.id] === 0 ? '' : completedQuantities[item.id]) : ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                            if (val >= 0 && val <= maxAllowed) {
                              setCompletedQuantities(prev => ({ ...prev, [item.id]: val }));
                            }
                          }}
                          placeholder="0"
                          className="w-20 h-8 text-center"
                          data-testid={`input-completed-${item.id}`}
                        />
                        <Button
                          size="sm" variant="outline"
                          onClick={() => {
                            const newQty = completedQuantities[item.id] || 0;
                            if (newQty > 0) {
                              handleCompletedQuantity(item.id, currentCompleted + newQty);
                            }
                          }}
                          disabled={updateCompleted.isPending || !(completedQuantities[item.id] > 0)}
                          data-testid={`button-save-completed-${item.id}`}
                        >
                          حفظ
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOrderCard = (order: any) => (
    <Card key={order.id} data-testid={`card-order-${order.id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono font-bold text-lg" data-testid={`text-order-id-${order.id}`}>#{order.id}</span>
          <Badge variant="secondary" className={getStatusColor(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-bold text-slate-700" data-testid={`text-sales-point-${order.id}`}>
            {order.salesPoint?.salesPointName || order.salesPoint?.firstName}
          </span>
          <span className="text-xs text-slate-400">
            {order.createdAt && format(new Date(order.createdAt), 'PP', { locale: arSA })}
          </span>
        </div>

        {(order.status === 'completed' || ((order.status === 'in_progress' || order.status === 'accepted') && (hasCompletedItems(order) || hasAcceptedOrCompletedItems(order)))) && (
          <Button
            size="sm" className="w-full gap-2"
            onClick={() => handleShip(order.id)}
            disabled={updateStatus.isPending}
            data-testid={`button-ship-${order.id}`}
          >
            <Truck className="h-4 w-4" />
            شحن الكمية المستلمة
          </Button>
        )}
        {order.status === 'shipped' && (
          <p className="text-sm text-slate-400 text-center">في الطريق</p>
        )}
        {order.status === 'received' && (
          <p className="text-sm text-green-600 text-center">تم التسليم</p>
        )}

        {order.items && order.items.length > 0 && renderOrderItems(order)}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="shipping" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900" data-testid="text-page-title">إدارة الشحن</h1>
            <p className="text-slate-500">استلام البضائع من المصنع وشحنها إلى نقاط البيع</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'ready', label: 'جاهز للشحن', count: readyOrders.length },
              { key: 'shipped', label: 'تم الشحن', count: orders?.filter((o: any) => o.status === 'shipped').length || 0 },
              { key: 'received', label: 'تم الاستلام', count: orders?.filter((o: any) => o.status === 'received').length || 0 },
              { key: 'all', label: 'الكل', count: readyOrders.length + (orders?.filter((o: any) => ['shipped', 'received'].includes(o.status)).length || 0) },
            ].map(f => (
              <Button key={f.key} variant={activeFilter === f.key ? 'default' : 'outline'} size="sm"
                onClick={() => setActiveFilter(f.key)} data-testid={`filter-${f.key}`}>
                {f.label} ({f.count})
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOrders?.map((order: any) => renderOrderCard(order))}
              {filteredOrders?.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400">لا توجد طلبات</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
