import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useConfirmItemReceived } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, PackageCheck, Check } from "lucide-react";
import { formatMaghrebDate } from "@/lib/queryClient";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AnimatedCard } from "@/components/animated-card";

const ITEM_STATUS_FILTERS: Record<string, (item: any) => boolean> = {
  pending: (i) => ['pending', 'accepted'].includes(i.itemStatus || 'pending'),
  in_progress: (i) => (i.itemStatus || 'pending') === 'in_progress',
  completed: (i) => (i.itemStatus || 'pending') === 'completed',
  rejected: (i) => (i.itemStatus || 'pending') === 'rejected',
  shipped: (i) => (i.shippedQuantity || 0) > 0,
  received: (i) => (i.itemStatus || 'pending') === 'received',
};

export default function SalesOrders() {
  const { data: orders, isLoading } = useOrders();
  const confirmItemReceived = useConfirmItemReceived();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<string>('active');

  const allFlatItems = useMemo(() => {
    if (!orders) return [];
    const flat: { item: any; order: any }[] = [];
    for (const order of orders) {
      for (const item of order.items || []) {
        flat.push({ item, order });
      }
    }
    return flat;
  }, [orders]);

  const filteredFlatItems = useMemo(() => {
    if (!allFlatItems.length) return [];
    switch (activeFilter) {
      case 'active':
        return allFlatItems.filter(({ order }) => !['received'].includes(order.status));
      case 'pending':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected'].includes(order.status) && ITEM_STATUS_FILTERS.pending(item)
        );
      case 'in_progress':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) && ITEM_STATUS_FILTERS.in_progress(item)
        );
      case 'completed':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) && ITEM_STATUS_FILTERS.completed(item)
        );
      case 'shipped':
        return allFlatItems.filter(({ item, order }) =>
          order.status === 'shipped' || ITEM_STATUS_FILTERS.shipped(item)
        );
      case 'rejected':
        return allFlatItems.filter(({ item, order }) =>
          ITEM_STATUS_FILTERS.rejected(item) || order.status === 'rejected'
        );
      case 'received':
        return allFlatItems.filter(({ item, order }) =>
          order.status === 'received' || ITEM_STATUS_FILTERS.received(item)
        );
      default:
        return allFlatItems;
    }
  }, [allFlatItems, activeFilter]);

  const countByFilter = (filter: string) => {
    if (!allFlatItems.length) return 0;
    switch (filter) {
      case 'active': return allFlatItems.filter(({ order }) => !['received'].includes(order.status)).length;
      case 'pending': return allFlatItems.filter(({ item, order }) =>
        !['shipped', 'received', 'rejected'].includes(order.status) && ITEM_STATUS_FILTERS.pending(item)
      ).length;
      case 'in_progress': return allFlatItems.filter(({ item, order }) =>
        !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) && ITEM_STATUS_FILTERS.in_progress(item)
      ).length;
      case 'completed': return allFlatItems.filter(({ item, order }) =>
        !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) && ITEM_STATUS_FILTERS.completed(item)
      ).length;
      case 'shipped': return allFlatItems.filter(({ item, order }) =>
        order.status === 'shipped' || ITEM_STATUS_FILTERS.shipped(item)
      ).length;
      case 'rejected': return allFlatItems.filter(({ item, order }) =>
        ITEM_STATUS_FILTERS.rejected(item) || order.status === 'rejected'
      ).length;
      case 'received': return allFlatItems.filter(({ item, order }) =>
        order.status === 'received' || ITEM_STATUS_FILTERS.received(item)
      ).length;
      default: return allFlatItems.length;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':    return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed':   return 'bg-green-100 text-green-800';
      case 'rejected':    return 'bg-red-100 text-red-800';
      case 'shipped':     return 'bg-purple-100 text-purple-800';
      case 'received':    return 'bg-teal-100 text-teal-800';
      default:            return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':    return 'مقبول';
      case 'rejected':    return 'مرفوض';
      case 'in_progress': return 'قيد الإنجاز';
      case 'completed':   return 'منجز';
      case 'shipped':     return 'تم الشحن';
      case 'received':    return 'تم الاستلام';
      default:            return 'في الانتظار';
    }
  };

  const getItemStatusStyle = (status: string): { badge: string; headerBg: string; border: string } => {
    switch (status) {
      case 'accepted':   return { badge: 'bg-emerald-100 text-emerald-800', headerBg: 'bg-emerald-50', border: 'border-2 border-emerald-300' };
      case 'in_progress': return { badge: 'bg-blue-100 text-blue-800',     headerBg: 'bg-blue-50',    border: 'border-2 border-blue-300' };
      case 'completed':  return { badge: 'bg-green-100 text-green-800',    headerBg: 'bg-green-50',   border: 'border-2 border-green-300' };
      case 'rejected':   return { badge: 'bg-red-100 text-red-800',        headerBg: 'bg-red-50',     border: 'border-2 border-red-300' };
      case 'received':   return { badge: 'bg-teal-100 text-teal-800',      headerBg: 'bg-teal-50',    border: 'border-2 border-teal-300' };
      default:           return { badge: 'bg-amber-100 text-amber-800',    headerBg: 'bg-amber-50',   border: 'border-2 border-amber-300' };
    }
  };

  const getItemStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':    return 'مقبول';
      case 'in_progress': return 'قيد الإنجاز';
      case 'completed':   return 'تم الإنجاز';
      case 'rejected':    return 'مرفوض';
      case 'received':    return 'تم الاستلام';
      default:            return 'في الانتظار';
    }
  };

  const getUnitLabel = (unit: string) => unit === 'bag' ? 'شكارة 20 كغ' : 'قطعة';

  const handleConfirmItemReceived = (itemId: number, shippedQuantity: number) => {
    confirmItemReceived.mutate(
      { itemId, receivedQuantity: shippedQuantity },
      {
        onSuccess: () => { toast({ title: 'تم تأكيد استلام الصنف بنجاح' }); },
        onError: (err: any) => {
          toast({ title: 'خطأ', description: err.message || 'فشل تأكيد الاستلام', variant: 'destructive' });
        },
      }
    );
  };

  const renderItemCard = ({ item, order }: { item: any; order: any }) => {
    const itemSt = item.itemStatus || 'pending';
    const isShipped = (item.shippedQuantity || 0) > 0;
    const isReceived = itemSt === 'received';
    const style = getItemStatusStyle(isReceived ? 'received' : itemSt);
    const completedQty = item.completedQuantity || 0;
    const shippedQty = item.shippedQuantity || 0;
    const receivedQty = item.receivedQuantity || shippedQty;
    const totalQty = item.quantity || 1;
    const completedPct = Math.min(Math.round((completedQty / totalQty) * 100), 100);
    const shippedPct = Math.min(Math.round((shippedQty / totalQty) * 100), 100);
    const showProgress = completedQty > 0 || shippedQty > 0;

    return (
      <Card
        key={`${order.id}-${item.id}`}
        className={`overflow-hidden bg-white ${style.border}`}
        data-testid={`card-item-${item.id}`}
      >
        {/* Header */}
        <CardHeader className={`${style.headerBg} px-4 py-3 space-y-1 border-b border-slate-200`}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-sm text-slate-800" data-testid={`text-order-ref-${item.id}`}>
              طلب #{order.id}
            </span>
            <Badge variant="secondary" className={`text-[10px] shrink-0 ${getStatusColor(order.status)}`} data-testid={`badge-order-status-${item.id}`}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">
              {order.createdAt && formatMaghrebDate(order.createdAt)}
            </span>
            <Badge variant="secondary" className={`text-[10px] ${style.badge}`}>
              {getItemStatusLabel(isReceived ? 'received' : itemSt)}
            </Badge>
          </div>
        </CardHeader>

        {/* Body */}
        <CardContent className="px-4 py-3 space-y-3">
          <div className="space-y-1">
            <p className="font-bold text-base text-slate-900 leading-tight" data-testid={`text-item-name-${item.id}`}>
              {item.product?.name}
            </p>
            <p className="text-xs text-slate-400 font-mono">{item.product?.sku}</p>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
            <span className="text-xs text-slate-500">الكمية المطلوبة</span>
            <span className="font-bold text-slate-800 text-sm" data-testid={`text-item-qty-${item.id}`}>
              {item.quantity} {getUnitLabel(item.unit || 'piece')}
            </span>
          </div>

          {showProgress && (
            <div className="space-y-1.5">
              {completedQty > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">الإنجاز</span>
                    <span className="font-semibold text-emerald-700">{completedQty} / {totalQty} <span className="text-slate-400">({completedPct}%)</span></span>
                  </div>
                  <Progress value={completedPct} className="h-2 bg-slate-200 [&>div]:bg-emerald-500" />
                </div>
              )}
              {shippedQty > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{isReceived ? 'تم الاستلام' : 'الشحن'}</span>
                    <span className={`font-semibold ${isReceived ? 'text-teal-700' : 'text-purple-700'}`}>
                      {isReceived ? receivedQty : shippedQty} / {totalQty} <span className="text-slate-400">({shippedPct}%)</span>
                    </span>
                  </div>
                  <Progress value={shippedPct} className={`h-2 bg-slate-200 ${isReceived ? '[&>div]:bg-teal-500' : '[&>div]:bg-purple-500'}`} />
                </div>
              )}
            </div>
          )}

          {isReceived && (
            <div className="flex items-center gap-2 text-teal-700 text-xs bg-teal-50 rounded-lg px-3 py-2" data-testid={`text-item-received-${item.id}`}>
              <PackageCheck className="h-4 w-4 shrink-0" />
              <span className="font-semibold">تم تأكيد الاستلام</span>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        {isShipped && !isReceived && (
          <CardFooter className="px-4 py-3 border-t border-slate-100">
            <Button
              size="sm"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2"
              onClick={() => handleConfirmItemReceived(item.id, item.shippedQuantity)}
              disabled={confirmItemReceived.isPending}
              data-testid={`button-confirm-item-received-${item.id}`}
            >
              <Check className="h-4 w-4" />
              تأكيد استلام ({item.shippedQuantity} {getUnitLabel(item.unit || 'piece')})
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="sales_point" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900">جميع الطلبات</h1>
            <p className="text-slate-500 text-sm">متابعة حالة جميع الطلبات المرسلة إلى المصنع</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'active', label: 'الطلبات النشطة' },
              { key: 'pending', label: 'في الانتظار' },
              { key: 'in_progress', label: 'قيد العمل' },
              { key: 'completed', label: 'منجز' },
              { key: 'shipped', label: 'تم الشحن' },
              { key: 'rejected', label: 'مرفوض' },
              { key: 'received', label: 'تم الاستلام' },
              { key: 'all', label: 'الكل' },
            ].map(f => (
              <Button key={f.key} variant={activeFilter === f.key ? 'default' : 'outline'} size="sm"
                onClick={() => setActiveFilter(f.key)} data-testid={`filter-${f.key}`}>
                {f.label} ({countByFilter(f.key)})
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : filteredFlatItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg font-medium">لا توجد طلبات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFlatItems.map((entry, i) => (
                <AnimatedCard key={`${entry.order.id}-${entry.item.id}`} index={i}>
                  {renderItemCard(entry)}
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
