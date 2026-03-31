import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useConfirmItemReceived } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, PackageCheck, Check } from "lucide-react";
import { formatMaghrebDate } from "@/lib/queryClient";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
          !['shipped', 'received', 'rejected'].includes(order.status) &&
          ITEM_STATUS_FILTERS.pending(item)
        );
      case 'in_progress':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) &&
          ITEM_STATUS_FILTERS.in_progress(item)
        );
      case 'completed':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) &&
          ITEM_STATUS_FILTERS.completed(item)
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
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-teal-100 text-teal-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'مقبول';
      case 'rejected': return 'مرفوض';
      case 'in_progress': return 'قيد الإنجاز';
      case 'completed': return 'منجز';
      case 'shipped': return 'تم الشحن';
      case 'received': return 'تم الاستلام';
      default: return 'في الانتظار';
    }
  };

  const getItemStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'مقبول';
      case 'in_progress': return 'قيد الإنجاز';
      case 'completed': return 'تم الإنجاز';
      case 'rejected': return 'مرفوض';
      case 'received': return 'تم الاستلام';
      default: return 'في الانتظار';
    }
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'received': return 'bg-teal-100 text-teal-800';
      default: return 'bg-amber-100 text-orange-800';
    }
  };

  const getUnitLabel = (unit: string) => unit === 'bag' ? 'شكارة 25 كغ' : 'قطعة';

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

    return (
      <Card
        key={`${order.id}-${item.id}`}
        className={isReceived ? 'border-teal-200' : ''}
        data-testid={`card-item-${item.id}`}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-500" data-testid={`text-order-ref-${item.id}`}>
                طلب #{order.id}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">{order.createdAt && formatMaghrebDate(order.createdAt)}</span>
            </div>
            <Badge variant="secondary" className={`text-[10px] ${getStatusColor(order.status)}`} data-testid={`badge-order-status-${item.id}`}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm break-words" data-testid={`text-item-name-${item.id}`}>
                {item.product?.name}
              </p>
              <p className="text-[10px] text-slate-400">{item.product?.sku}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={item.unit === 'bag' ? 'default' : 'outline'} className="text-[10px]">
                {getUnitLabel(item.unit || 'piece')}
              </Badge>
              <span className="font-bold text-lg text-primary" data-testid={`text-item-qty-${item.id}`}>
                {item.quantity}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={`text-[10px] ${isReceived ? 'bg-teal-100 text-teal-800' : getItemStatusColor(itemSt)}`}>
              {isReceived ? 'تم الاستلام' : getItemStatusLabel(itemSt)}
            </Badge>
            {item.completedQuantity > 0 && (
              <span className="text-[10px] text-green-700">منجز: {item.completedQuantity}</span>
            )}
            {isShipped && (
              <span className="text-[10px] text-purple-700">مشحون: {item.shippedQuantity}</span>
            )}
            {isReceived && (
              <span className="text-[10px] text-teal-700">مستلم: {item.receivedQuantity || item.shippedQuantity}</span>
            )}
          </div>

          {isShipped && !isReceived && (
            <div className="pt-1 border-t border-slate-100">
              <Button
                size="sm"
                className="w-full bg-teal-600 text-white gap-2"
                onClick={() => handleConfirmItemReceived(item.id, item.shippedQuantity)}
                disabled={confirmItemReceived.isPending}
                data-testid={`button-confirm-item-received-${item.id}`}
              >
                <Check className="h-3 w-3" />
                <span>تأكيد استلام ({item.shippedQuantity} {getUnitLabel(item.unit || 'piece')})</span>
              </Button>
            </div>
          )}

          {isReceived && (
            <div className="pt-1 border-t border-teal-100 flex items-center gap-1 text-teal-700 text-xs" data-testid={`text-item-received-${item.id}`}>
              <PackageCheck className="h-3 w-3" />
              <span>تم تأكيد الاستلام</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="sales_point" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">جميع الطلبات</h1>
            <p className="text-slate-500">متابعة حالة جميع الطلبات المرسلة إلى المصنع</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'active', label: 'الطلبات النشطة', count: countByFilter('active') },
              { key: 'pending', label: 'في الانتظار', count: countByFilter('pending') },
              { key: 'in_progress', label: 'قيد العمل', count: countByFilter('in_progress') },
              { key: 'completed', label: 'منجز', count: countByFilter('completed') },
              { key: 'shipped', label: 'تم الشحن', count: countByFilter('shipped') },
              { key: 'rejected', label: 'مرفوض', count: countByFilter('rejected') },
              { key: 'received', label: 'تم الاستلام', count: countByFilter('received') },
              { key: 'all', label: 'الكل', count: countByFilter('all') },
            ].map(f => (
              <Button key={f.key} variant={activeFilter === f.key ? 'default' : 'outline'} size="sm"
                onClick={() => setActiveFilter(f.key)} data-testid={`filter-${f.key}`}>
                {f.label} ({f.count})
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : filteredFlatItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
              لا توجد طلبات
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFlatItems.map(renderItemCard)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
