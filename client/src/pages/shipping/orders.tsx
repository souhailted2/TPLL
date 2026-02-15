import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateCompletedQuantity, useShipItem } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Truck, Package, Send, ClipboardCheck, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMaghrebDate } from "@/lib/queryClient";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ShippingOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateCompleted = useUpdateCompletedQuantity();
  const shipItem = useShipItem();
  const [activeTab, setActiveTab] = useState<string>('receive');
  const [completedQuantities, setCompletedQuantities] = useState<Record<number, number>>({});
  const [shipQuantities, setShipQuantities] = useState<Record<number, number>>({});
  const { toast } = useToast();

  const activeOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o: any) =>
      ['accepted', 'in_progress', 'completed'].includes(o.status)
    );
  }, [orders]);

  const ordersWithShippableItems = useMemo(() => {
    return activeOrders.filter((o: any) =>
      o.items?.some((item: any) => {
        const completed = item.completedQuantity || 0;
        const shipped = item.shippedQuantity || 0;
        return completed > shipped && ['accepted', 'in_progress', 'completed'].includes(item.itemStatus || 'pending');
      })
    );
  }, [activeOrders]);

  const ordersForReceiving = useMemo(() => {
    return activeOrders.filter((o: any) =>
      o.items?.some((item: any) =>
        ['accepted', 'in_progress', 'completed'].includes(item.itemStatus || 'pending')
      )
    );
  }, [activeOrders]);

  const shippedOrders = useMemo(() => {
    if (!orders) return [];
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
  }, [orders]);

  const receivedOrders = useMemo(() => {
    if (!orders) return [];
    const result: any[] = [];
    for (const order of orders) {
      if (order.status === 'received') {
        result.push({ ...order });
        continue;
      }
      const receivedItems = (order.items || []).filter((i: any) => (i.itemStatus || 'pending') === 'received');
      if (receivedItems.length > 0) {
        result.push({ ...order, _filteredItems: receivedItems });
      }
    }
    return result;
  }, [orders]);

  const handleCompletedQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateCompleted.mutateAsync({ itemId, completedQuantity: quantity });
      toast({ title: "تم التحديث", description: "تم تحديث الكمية المستلمة من المصنع" });
      setCompletedQuantities(prev => ({ ...prev, [itemId]: 0 }));
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleShipItem = async (itemId: number, quantity: number) => {
    try {
      await shipItem.mutateAsync({ itemId, shippedQuantity: quantity });
      toast({ title: "تم الشحن", description: "تم شحن الكمية بنجاح" });
      setShipQuantities(prev => ({ ...prev, [itemId]: 0 }));
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
      case 'accepted': return 'قيد الإنجاز';
      case 'completed': return 'مكتمل';
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
      case 'received': return 'تم الاستلام';
      default: return 'في الانتظار';
    }
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

  const getUnitLabel = (unit: string) => {
    return unit === 'bag' ? 'شكارة 25 كغ' : 'قطعة';
  };

  const renderReceiveCard = (order: any) => {
    const items = (order.items || []).filter((item: any) =>
      ['accepted', 'in_progress', 'completed'].includes(item.itemStatus || 'pending')
    );

    return (
      <Card key={order.id} data-testid={`card-receive-${order.id}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-blue-600" />
              <span className="font-mono font-bold text-lg" data-testid={`text-order-id-${order.id}`}>#{order.id}</span>
            </div>
            <Badge variant="secondary" className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-bold text-slate-700">{order.salesPoint?.salesPointName || order.salesPoint?.firstName}</span>
            <span className="text-xs text-slate-400">{order.createdAt && formatMaghrebDate(order.createdAt)}</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {items.map((item: any, idx: number) => {
              const maxAllowed = Math.ceil(item.quantity * 1.5);
              const currentCompleted = item.completedQuantity || 0;

              return (
                <div key={idx} className="p-3 rounded-lg border bg-white" data-testid={`receive-item-${item.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm break-words">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-400">{item.product?.sku}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className={`text-[10px] ${getItemStatusColor(item.itemStatus)}`}>
                        {getItemStatusLabel(item.itemStatus)}
                      </Badge>
                      <span className="font-bold text-primary">{item.quantity}</span>
                      <span className="text-[10px] text-slate-400">{getUnitLabel(item.unit || 'piece')}</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-3 text-xs mb-2">
                      <span className="text-slate-500">المطلوب: <span className="font-bold">{item.quantity}</span></span>
                      <span className="text-slate-500">المستلم من المصنع: <span className="font-bold text-green-700">{currentCompleted}</span></span>
                      <span className="text-slate-500">الحد الأقصى: <span className="font-bold text-orange-600">{maxAllowed}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600 shrink-0 font-medium">إضافة كمية:</span>
                      <Input
                        type="number"
                        min={0}
                        max={maxAllowed - currentCompleted}
                        value={completedQuantities[item.id] !== undefined ? (completedQuantities[item.id] === 0 ? '' : completedQuantities[item.id]) : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          const remaining = maxAllowed - currentCompleted;
                          if (val >= 0 && val <= remaining) {
                            setCompletedQuantities(prev => ({ ...prev, [item.id]: val }));
                          }
                        }}
                        placeholder="0"
                        className="w-20 text-center"
                        data-testid={`input-completed-${item.id}`}
                      />
                      <Button
                        size="sm" variant="outline"
                        className="gap-1"
                        onClick={() => {
                          const newQty = completedQuantities[item.id] || 0;
                          if (newQty > 0) {
                            handleCompletedQuantity(item.id, currentCompleted + newQty);
                          }
                        }}
                        disabled={updateCompleted.isPending || !(completedQuantities[item.id] > 0)}
                        data-testid={`button-save-completed-${item.id}`}
                      >
                        <ClipboardCheck className="h-3 w-3" />
                        تأكيد الاستلام
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderShipCard = (order: any) => {
    const items = (order.items || []).filter((item: any) => {
      const completed = item.completedQuantity || 0;
      const shipped = item.shippedQuantity || 0;
      return completed > shipped && ['accepted', 'in_progress', 'completed'].includes(item.itemStatus || 'pending');
    });

    if (items.length === 0) return null;

    return (
      <Card key={order.id} className="border-purple-200" data-testid={`card-ship-${order.id}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-600" />
              <span className="font-mono font-bold text-lg">#{order.id}</span>
            </div>
            <Badge variant="secondary" className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-bold text-slate-700">{order.salesPoint?.salesPointName || order.salesPoint?.firstName}</span>
            <span className="text-xs text-slate-400">{order.createdAt && formatMaghrebDate(order.createdAt)}</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-purple-100">
            {items.map((item: any, idx: number) => {
              const currentCompleted = item.completedQuantity || 0;
              const currentShipped = item.shippedQuantity || 0;
              const shippable = currentCompleted - currentShipped;

              return (
                <div key={idx} className="p-3 rounded-lg border border-purple-200 bg-purple-50/50" data-testid={`ship-item-${item.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm break-words">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-400">{item.product?.sku}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-primary">{item.quantity}</span>
                      <span className="text-[10px] text-slate-400">{getUnitLabel(item.unit || 'piece')}</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-purple-100">
                    <div className="flex flex-wrap items-center gap-3 text-xs mb-2">
                      <span className="text-slate-500">المنجز: <span className="font-bold text-green-700">{currentCompleted}</span></span>
                      <span className="text-slate-500">المشحون: <span className="font-bold text-purple-700">{currentShipped}</span></span>
                      <span className="text-purple-700 font-bold">متاح للشحن: {shippable}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Send className="h-3 w-3 text-purple-600 shrink-0" />
                      <span className="text-xs text-purple-700 shrink-0 font-medium">كمية الشحن:</span>
                      <Input
                        type="number"
                        min={1}
                        max={shippable}
                        value={shipQuantities[item.id] !== undefined ? (shipQuantities[item.id] === 0 ? '' : shipQuantities[item.id]) : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          if (val >= 0 && val <= shippable) {
                            setShipQuantities(prev => ({ ...prev, [item.id]: val }));
                          }
                        }}
                        placeholder={`1 - ${shippable}`}
                        className="w-24 text-center"
                        data-testid={`input-ship-${item.id}`}
                      />
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          const qty = shipQuantities[item.id] || 0;
                          if (qty > 0 && qty <= shippable) {
                            handleShipItem(item.id, currentShipped + qty);
                          }
                        }}
                        disabled={shipItem.isPending || !(shipQuantities[item.id] > 0)}
                        data-testid={`button-ship-item-${item.id}`}
                      >
                        <Truck className="h-3 w-3" />
                        شحن
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHistoryCard = (order: any) => {
    const items = order._filteredItems || order.items || [];

    return (
      <Card key={order.id} data-testid={`card-history-${order.id}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-lg">#{order.id}</span>
            <Badge variant="secondary" className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-bold text-slate-700">{order.salesPoint?.salesPointName || order.salesPoint?.firstName}</span>
            <span className="text-xs text-slate-400">{order.createdAt && formatMaghrebDate(order.createdAt)}</span>
          </div>
          <div className="space-y-1 pt-2 border-t border-slate-100">
            {items.filter((i: any) => i.itemStatus !== 'rejected').map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-2 text-xs p-2 rounded bg-slate-50">
                <span className="font-medium">{item.product?.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">منجز: <span className="font-bold text-green-700">{item.completedQuantity || 0}</span></span>
                  <span className="text-purple-600">مشحون: <span className="font-bold">{item.shippedQuantity || 0}</span></span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const tabs = [
    { key: 'receive', label: 'استلام من المصنع', icon: ArrowDownToLine, count: ordersForReceiving.length },
    { key: 'ready', label: 'جاهز للشحن', icon: Truck, count: ordersWithShippableItems.length },
    { key: 'shipped', label: 'تم الشحن', icon: Send, count: shippedOrders.length },
    { key: 'received', label: 'تم الاستلام', icon: Package, count: receivedOrders.length },
  ];

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    }

    let items: any[] = [];
    let renderFn: (order: any) => any;

    switch (activeTab) {
      case 'receive':
        items = ordersForReceiving;
        renderFn = renderReceiveCard;
        break;
      case 'ready':
        items = ordersWithShippableItems;
        renderFn = renderShipCard;
        break;
      case 'shipped':
        items = shippedOrders;
        renderFn = renderHistoryCard;
        break;
      case 'received':
        items = receivedOrders;
        renderFn = renderHistoryCard;
        break;
      default:
        items = [];
        renderFn = renderHistoryCard;
    }

    if (items.length === 0) {
      return <div className="col-span-full text-center py-12 text-slate-400">لا توجد طلبات</div>;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((order: any) => renderFn(order))}
      </div>
    );
  };

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
            {tabs.map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                data-testid={`filter-${tab.key}`}
                className="gap-1"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label} ({tab.count})
              </Button>
            ))}
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
