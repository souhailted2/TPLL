import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateItemStatus, useDismissOrderAlert } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Check, X as XIcon, AlertTriangle, BellOff, PlayCircle, CheckCircle2, Printer, Search, Pencil, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMaghrebDate } from "@/lib/queryClient";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { WorkshopItemPrint } from "@/components/workshop-order-print";

const ALERT_DAYS = 15;

function isItemAlert(item: any, order: any): boolean {
  if (order.alertDismissed) return false;
  if (['shipped', 'received', 'rejected'].includes(order.status)) return false;
  if (item.completedQuantity === item.quantity) return false;
  const referenceDate = item.lastCompletedUpdate
    ? new Date(item.lastCompletedUpdate)
    : (order.createdAt ? new Date(order.createdAt) : null);
  if (!referenceDate) return false;
  const daysSince = (new Date().getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= ALERT_DAYS;
}

const ITEM_STATUS_FILTERS: Record<string, (item: any) => boolean> = {
  pending: (i) => ['pending', 'accepted'].includes(i.itemStatus || 'pending'),
  in_progress: (i) => (i.itemStatus || 'pending') === 'in_progress',
  completed: (i) => (i.itemStatus || 'pending') === 'completed',
  rejected: (i) => (i.itemStatus || 'pending') === 'rejected',
  shipped: (i) => (i.shippedQuantity || 0) > 0,
};

export default function ReceptionOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateItemStatus = useUpdateItemStatus();
  const dismissAlert = useDismissOrderAlert();
  const [activeFilter, setActiveFilter] = useState<string>('pending');
  const [printItem, setPrintItem] = useState<{ order: any; item: any } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [correctingItem, setCorrectingItem] = useState<number | null>(null);
  const [correctStatus, setCorrectStatus] = useState<string>('pending');
  const { toast } = useToast();

  const handleItemStatusChange = async (itemId: number, newStatus: string) => {
    try {
      await updateItemStatus.mutateAsync({ itemId, itemStatus: newStatus });
      const labels: Record<string, string> = {
        accepted: 'تم قبول الصنف',
        rejected: 'تم رفض الصنف',
        in_progress: 'الصنف قيد الإنجاز',
        completed: 'تم إنجاز الصنف',
        pending: 'تم إعادة الصنف للانتظار',
      };
      toast({ title: labels[newStatus] || "تم التحديث" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
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

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-teal-100 text-teal-800';
      default: return 'bg-amber-100 text-orange-800';
    }
  };

  const getOrderStatusLabel = (status: string) => {
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

  const getItemStatusStyle = (status: string): { badge: string; headerBg: string; leftBorder: string } => {
    switch (status) {
      case 'accepted':   return { badge: 'bg-emerald-100 text-emerald-800', headerBg: 'bg-emerald-50', leftBorder: 'border-l-emerald-500' };
      case 'in_progress': return { badge: 'bg-blue-100 text-blue-800',     headerBg: 'bg-blue-50',    leftBorder: 'border-l-blue-500' };
      case 'completed':  return { badge: 'bg-green-100 text-green-800',    headerBg: 'bg-green-50',   leftBorder: 'border-l-green-500' };
      case 'rejected':   return { badge: 'bg-red-100 text-red-800',        headerBg: 'bg-red-50',     leftBorder: 'border-l-red-500' };
      case 'received':   return { badge: 'bg-teal-100 text-teal-800',      headerBg: 'bg-teal-50',    leftBorder: 'border-l-teal-500' };
      default:           return { badge: 'bg-amber-100 text-amber-800',    headerBg: 'bg-amber-50',   leftBorder: 'border-l-amber-400' };
    }
  };

  const getItemStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':   return 'مقبول';
      case 'rejected':   return 'مرفوض';
      case 'in_progress': return 'قيد الإنجاز';
      case 'completed':  return 'تم الإنجاز';
      case 'received':   return 'تم الاستلام';
      default:           return 'في الانتظار';
    }
  };

  const getUnitLabel = (unit: string) => unit === 'bag' ? 'شكارة 20 كغ' : 'قطعة';

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
    let result = allFlatItems;
    switch (activeFilter) {
      case 'pending':
        result = result.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected'].includes(order.status) &&
          ITEM_STATUS_FILTERS.pending(item)
        );
        break;
      case 'in_progress':
        result = result.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) &&
          ITEM_STATUS_FILTERS.in_progress(item)
        );
        break;
      case 'completed':
        result = result.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) &&
          ITEM_STATUS_FILTERS.completed(item)
        );
        break;
      case 'rejected':
        result = result.filter(({ item }) => ITEM_STATUS_FILTERS.rejected(item));
        break;
      case 'shipped':
        result = result.filter(({ item }) => ITEM_STATUS_FILTERS.shipped(item));
        break;
      case 'alerts':
        result = result.filter(({ item, order }) => isItemAlert(item, order));
        break;
      default:
        break;
    }
    return result;
  }, [allFlatItems, activeFilter]);

  const searchFilteredItems = useMemo(() => {
    if (!searchTerm.trim()) return filteredFlatItems;
    const term = searchTerm.trim().toLowerCase();
    return allFlatItems.filter(({ item, order }) =>
      String(order.id).includes(term) ||
      (order.salesPoint?.salesPointName || order.salesPoint?.firstName || '').toLowerCase().includes(term) ||
      (item.product?.name || '').toLowerCase().includes(term) ||
      (item.product?.sku || '').toLowerCase().includes(term)
    );
  }, [allFlatItems, filteredFlatItems, searchTerm]);

  const countByFilter = (filter: string) => {
    if (!allFlatItems.length) return 0;
    switch (filter) {
      case 'pending':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected'].includes(order.status) &&
          ITEM_STATUS_FILTERS.pending(item)
        ).length;
      case 'in_progress':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) &&
          ITEM_STATUS_FILTERS.in_progress(item)
        ).length;
      case 'completed':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) &&
          ITEM_STATUS_FILTERS.completed(item)
        ).length;
      case 'rejected':
        return allFlatItems.filter(({ item }) => ITEM_STATUS_FILTERS.rejected(item)).length;
      case 'shipped':
        return allFlatItems.filter(({ item }) => ITEM_STATUS_FILTERS.shipped(item)).length;
      case 'alerts':
        return allFlatItems.filter(({ item, order }) => isItemAlert(item, order)).length;
      default:
        return allFlatItems.length;
    }
  };

  const alertCount = useMemo(() => countByFilter('alerts'), [allFlatItems]);

  const renderItemCard = ({ item, order }: { item: any; order: any }) => {
    const itemSt = item.itemStatus || 'pending';
    const hasAlert = isItemAlert(item, order);
    const style = getItemStatusStyle(itemSt);
    const completedQty = item.completedQuantity || 0;
    const shippedQty = item.shippedQuantity || 0;
    const totalQty = item.quantity || 1;
    const completedPct = Math.min(Math.round((completedQty / totalQty) * 100), 100);
    const shippedPct = Math.min(Math.round((shippedQty / totalQty) * 100), 100);
    const showProgress = completedQty > 0 || shippedQty > 0;
    const canAct = order.status !== 'shipped' && order.status !== 'received';

    return (
      <Card
        key={`${order.id}-${item.id}`}
        className={`overflow-hidden bg-white border border-slate-200 border-l-4 ${hasAlert ? 'border-l-red-500' : style.leftBorder} shadow-md`}
        data-testid={`card-item-${item.id}`}
      >
        {/* ── Card Header ── */}
        <CardHeader className={`${hasAlert ? 'bg-red-50' : style.headerBg} px-4 py-3 space-y-1 border-b ${hasAlert ? 'border-red-200' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {hasAlert && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
              <span className="font-bold text-sm text-slate-800" data-testid={`text-order-ref-${item.id}`}>
                طلب #{order.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-sm text-slate-700 truncate" data-testid={`text-sales-point-${item.id}`}>
                {order.salesPoint?.salesPointName || order.salesPoint?.firstName}
              </span>
            </div>
            <Badge variant="secondary" className={`text-[10px] shrink-0 ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">
              {order.createdAt && formatMaghrebDate(order.createdAt)}
            </span>
            <Badge variant="secondary" className={`text-[10px] ${style.badge}`}>
              {getItemStatusLabel(itemSt)}
            </Badge>
          </div>
        </CardHeader>

        {/* ── Card Body ── */}
        <CardContent className="px-4 py-3 space-y-3">
          {/* Product name + quantity */}
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

          {/* Progress bar */}
          {showProgress && (
            <div className="space-y-1.5">
              {completedQty > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">الإنجاز</span>
                    <span className="font-semibold text-emerald-700">{completedQty} / {totalQty} <span className="text-slate-400">({completedPct}%)</span></span>
                  </div>
                  <Progress
                    value={completedPct}
                    className="h-2 bg-slate-200 [&>div]:bg-emerald-500"
                  />
                </div>
              )}
              {shippedQty > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">الشحن</span>
                    <span className="font-semibold text-purple-700">{shippedQty} / {totalQty} <span className="text-slate-400">({shippedPct}%)</span></span>
                  </div>
                  <Progress
                    value={shippedPct}
                    className="h-2 bg-slate-200 [&>div]:bg-purple-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Alert */}
          {hasAlert && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                <p className="text-xs text-red-700">
                  {completedQty < totalQty ? 'إنجاز غير مكتمل' : 'تجاوز الكمية'} — منذ أكثر من {ALERT_DAYS} يوم
                </p>
              </div>
              <Button
                size="sm" variant="ghost"
                className="h-6 text-[10px] text-red-500 px-2"
                onClick={() => handleDismissAlert(order.id)}
                disabled={dismissAlert.isPending}
                data-testid={`button-dismiss-alert-${item.id}`}
              >
                <BellOff className="h-3 w-3 ml-1" />
                إبطال
              </Button>
            </div>
          )}

          {/* Correction form */}
          {correctingItem === item.id && (
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-orange-800">تصحيح حالة الصنف</p>
              <Select value={correctStatus} onValueChange={setCorrectStatus}>
                <SelectTrigger className="text-xs bg-white" data-testid={`select-correct-status-${item.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="accepted">مقبول</SelectItem>
                  <SelectItem value="in_progress">قيد الإنجاز</SelectItem>
                  <SelectItem value="completed">منجز</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  size="sm" className="flex-1 gap-1 text-xs"
                  onClick={async () => {
                    try {
                      await updateItemStatus.mutateAsync({ itemId: item.id, itemStatus: correctStatus });
                      setCorrectingItem(null);
                    } catch {
                      toast({ title: 'خطأ في التصحيح', variant: 'destructive' });
                    }
                  }}
                  disabled={updateItemStatus.isPending}
                  data-testid={`button-save-correct-${item.id}`}
                >
                  <Save className="h-3 w-3" />
                  حفظ
                </Button>
                <Button
                  size="sm" variant="outline" className="gap-1 text-xs"
                  onClick={() => setCorrectingItem(null)}
                  data-testid={`button-cancel-correct-${item.id}`}
                >
                  <XIcon className="h-3 w-3" />
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {/* ── Card Footer — Action buttons ── */}
        {canAct && (
          <CardFooter className="px-4 py-3 border-t border-slate-100 flex flex-col gap-2">
            {/* Main action buttons */}
            {(itemSt === 'pending' || itemSt === 'accepted' || itemSt === 'in_progress') && (
              <div className="flex gap-2 w-full">
                {itemSt === 'pending' && (
                  <>
                    <Button
                      size="sm" variant="default"
                      className="flex-1 gap-1 text-sm"
                      onClick={() => handleItemStatusChange(item.id, 'accepted')}
                      disabled={updateItemStatus.isPending}
                      data-testid={`button-accept-item-${item.id}`}
                    >
                      <Check className="h-4 w-4" />
                      قبول
                    </Button>
                    <Button
                      size="sm" variant="destructive"
                      className="flex-1 gap-1 text-sm"
                      onClick={() => handleItemStatusChange(item.id, 'rejected')}
                      disabled={updateItemStatus.isPending}
                      data-testid={`button-reject-item-${item.id}`}
                    >
                      <XIcon className="h-4 w-4" />
                      رفض
                    </Button>
                  </>
                )}
                {itemSt === 'accepted' && (
                  <Button
                    size="sm" variant="outline"
                    className="flex-1 gap-1 text-sm border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => handleItemStatusChange(item.id, 'in_progress')}
                    disabled={updateItemStatus.isPending}
                    data-testid={`button-start-item-${item.id}`}
                  >
                    <PlayCircle className="h-4 w-4" />
                    بدء الإنجاز
                  </Button>
                )}
                {itemSt === 'in_progress' && (
                  <Button
                    size="sm" variant="default"
                    className="flex-1 gap-1 text-sm bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleItemStatusChange(item.id, 'completed')}
                    disabled={updateItemStatus.isPending}
                    data-testid={`button-complete-item-${item.id}`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    تم الإنجاز
                  </Button>
                )}
              </div>
            )}

            {/* Secondary actions */}
            <div className="flex gap-2 w-full">
              {(itemSt === 'accepted' || itemSt === 'in_progress' || itemSt === 'completed') && (
                <Button
                  size="sm" variant="outline"
                  className="flex-1 gap-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => setPrintItem({ order, item })}
                  data-testid={`button-print-item-${item.id}`}
                >
                  <Printer className="h-3.5 w-3.5" />
                  طباعة أمر ورشة
                </Button>
              )}
              <Button
                size="sm" variant="outline"
                className="flex-1 gap-1 text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => {
                  const allowed = ['pending', 'accepted', 'in_progress', 'completed'];
                  setCorrectingItem(correctingItem === item.id ? null : item.id);
                  setCorrectStatus(allowed.includes(itemSt) ? itemSt : 'pending');
                }}
                data-testid={`button-correct-item-${item.id}`}
              >
                <Pencil className="h-3.5 w-3.5" />
                تصحيح الحالة
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    );
  };

  const filters = [
    { key: 'pending', label: 'في الانتظار' },
    { key: 'in_progress', label: 'قيد العمل' },
    { key: 'completed', label: 'منجز' },
    { key: 'shipped', label: 'تم الشحن' },
    { key: 'rejected', label: 'مرفوض' },
    ...(alertCount > 0 ? [{ key: 'alerts', label: 'تنبيهات' }] : []),
    { key: 'all', label: 'الكل' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="reception" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900" data-testid="text-page-title">إدارة الطلبات</h1>
            <p className="text-slate-500 text-sm">قبول ورفض الأصناف وإدارة حالة الإنتاج</p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث: منتج، كود، فرع، أو رقم طلب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9 pl-8"
              data-testid="input-search-orders"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                data-testid="button-clear-search"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <Button
                key={f.key}
                variant={activeFilter === f.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(f.key)}
                data-testid={`filter-${f.key}`}
                className={f.key === 'alerts' ? 'border-red-300 text-red-600' : ''}
              >
                {f.label} ({countByFilter(f.key)})
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : searchFilteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg font-medium">لا توجد أصناف</p>
              <p className="text-sm mt-1">جرب تغيير الفلتر أو البحث</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {searchFilteredItems.map(renderItemCard)}
            </div>
          )}
        </div>
      </main>

      {printItem && (
        <WorkshopItemPrint
          order={printItem.order}
          item={printItem.item}
          onClose={() => setPrintItem(null)}
        />
      )}
    </div>
  );
}
