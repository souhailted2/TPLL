import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus, useUpdateItemStatus, useDismissOrderAlert } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Check, X as XIcon, AlertTriangle, BellOff, PlayCircle, CheckCircle2, Printer, Search, ChevronDown, Pencil, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
  const updateStatus = useUpdateOrderStatus();
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

  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
      const labels: Record<string, string> = {
        submitted: 'تم إعادة الطلب للانتظار',
        accepted: 'تم قبول الطلب',
        rejected: 'تم رفض الطلب',
        in_progress: 'الطلب قيد الإنجاز',
        completed: 'تم إنجاز الطلب',
      };
      toast({ title: labels[newStatus] || 'تم تحديث حالة الطلب' });
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
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

  const getItemStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'مقبول';
      case 'rejected': return 'مرفوض';
      case 'in_progress': return 'قيد الإنجاز';
      case 'completed': return 'تم الإنجاز';
      case 'received': return 'تم الاستلام';
      default: return 'في الانتظار';
    }
  };

  const getUnitLabel = (unit: string) => unit === 'bag' ? 'شكارة 25 كغ' : 'قطعة';

  const getItemCardBorder = (status: string) => {
    switch (status) {
      case 'accepted': return 'border-emerald-200';
      case 'in_progress': return 'border-blue-200';
      case 'completed': return 'border-green-200';
      case 'rejected': return 'border-red-200';
      default: return 'border-slate-200';
    }
  };

  const receptionOrderTransitions: Record<string, { label: string; target: string; color: string }[]> = {
    submitted: [
      { label: 'مقبول', target: 'accepted', color: 'text-emerald-700' },
      { label: 'مرفوض', target: 'rejected', color: 'text-red-700' },
    ],
    accepted: [
      { label: 'قيد الإنجاز', target: 'in_progress', color: 'text-blue-700' },
      { label: 'في الانتظار', target: 'submitted', color: 'text-amber-700' },
    ],
    rejected: [
      { label: 'في الانتظار', target: 'submitted', color: 'text-amber-700' },
    ],
    in_progress: [
      { label: 'منجز', target: 'completed', color: 'text-green-700' },
      { label: 'مقبول', target: 'accepted', color: 'text-emerald-700' },
    ],
    completed: [
      { label: 'قيد الإنجاز', target: 'in_progress', color: 'text-blue-700' },
    ],
  };

  // Flatten all items into individual entries with their parent order
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
    return filteredFlatItems.filter(({ item, order }) =>
      String(order.id).includes(term) ||
      (order.salesPoint?.salesPointName || order.salesPoint?.firstName || '').toLowerCase().includes(term) ||
      (item.product?.name || '').toLowerCase().includes(term) ||
      (item.product?.sku || '').toLowerCase().includes(term)
    );
  }, [filteredFlatItems, searchTerm]);

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
    const orderTransitions = receptionOrderTransitions[order.status] || [];
    const canChangeOrderStatus = !['shipped', 'received'].includes(order.status) && orderTransitions.length > 0;

    return (
      <Card
        key={`${order.id}-${item.id}`}
        className={`${getItemCardBorder(itemSt)} ${hasAlert ? 'border-red-300' : ''}`}
        data-testid={`card-item-${item.id}`}
      >
        <CardContent className="p-4 space-y-3">

          {/* Order header */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              {hasAlert && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
              <span className="font-mono text-xs font-bold text-slate-500" data-testid={`text-order-ref-${item.id}`}>
                طلب #{order.id}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-600" data-testid={`text-sales-point-${item.id}`}>
                {order.salesPoint?.salesPointName || order.salesPoint?.firstName}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">{order.createdAt && formatMaghrebDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="secondary" className={`text-[10px] ${getOrderStatusColor(order.status)}`}>
                {getOrderStatusLabel(order.status)}
              </Badge>
              {canChangeOrderStatus && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm" variant="ghost"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
                      disabled={updateStatus.isPending}
                      data-testid={`button-order-status-${order.id}`}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    <DropdownMenuLabel className="text-[10px] text-slate-500">تغيير حالة الطلب</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {orderTransitions.map((opt) => (
                      <DropdownMenuItem
                        key={opt.target}
                        className={`text-xs gap-2 cursor-pointer font-medium ${opt.color}`}
                        onClick={() => handleOrderStatusChange(order.id, opt.target)}
                        data-testid={`menu-order-status-${order.id}-${opt.target}`}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Item main info */}
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

          {/* Item status & quantities */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Badge variant="secondary" className={`text-[10px] ${getItemStatusColor(itemSt)}`}>
              {getItemStatusLabel(itemSt)}
            </Badge>
            <div className="flex items-center gap-3 text-xs">
              {item.completedQuantity > 0 && (
                <span className="text-slate-500">منجز: <span className="font-bold">{item.completedQuantity}</span></span>
              )}
              {(item.shippedQuantity || 0) > 0 && (
                <span className="text-purple-600">مشحون: <span className="font-bold">{item.shippedQuantity}</span></span>
              )}
            </div>
          </div>

          {/* Alert */}
          {hasAlert && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                <p className="text-xs text-red-700">
                  {item.completedQuantity < item.quantity ? 'إنجاز غير مكتمل' : 'تجاوز الكمية'} — منذ أكثر من {ALERT_DAYS} يوم
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

          {/* Action buttons */}
          {order.status !== 'shipped' && order.status !== 'received' && (
            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100">
              {itemSt === 'pending' && (
                <>
                  <Button
                    size="sm" variant="default"
                    className="text-xs gap-1"
                    onClick={() => handleItemStatusChange(item.id, 'accepted')}
                    disabled={updateItemStatus.isPending}
                    data-testid={`button-accept-item-${item.id}`}
                  >
                    <Check className="h-3 w-3" />
                    قبول
                  </Button>
                  <Button
                    size="sm" variant="destructive"
                    className="text-xs gap-1"
                    onClick={() => handleItemStatusChange(item.id, 'rejected')}
                    disabled={updateItemStatus.isPending}
                    data-testid={`button-reject-item-${item.id}`}
                  >
                    <XIcon className="h-3 w-3" />
                    رفض
                  </Button>
                </>
              )}
              {itemSt === 'accepted' && (
                <>
                  <Button
                    size="sm" variant="outline"
                    className="text-xs gap-1"
                    onClick={() => handleItemStatusChange(item.id, 'in_progress')}
                    disabled={updateItemStatus.isPending}
                    data-testid={`button-start-item-${item.id}`}
                  >
                    <PlayCircle className="h-3 w-3" />
                    بدء الإنجاز
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className="text-xs gap-1 text-slate-500"
                    onClick={() => handleItemStatusChange(item.id, 'pending')}
                    disabled={updateItemStatus.isPending}
                    data-testid={`button-reset-item-${item.id}`}
                  >
                    إعادة للانتظار
                  </Button>
                </>
              )}
              {itemSt === 'in_progress' && (
                <>
                  <Button
                    size="sm" variant="default"
                    className="text-xs gap-1"
                    onClick={() => handleItemStatusChange(item.id, 'completed')}
                    disabled={updateItemStatus.isPending}
                    data-testid={`button-complete-item-${item.id}`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    تم الإنجاز
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className="text-xs gap-1 text-slate-500"
                    onClick={() => handleItemStatusChange(item.id, 'accepted')}
                    disabled={updateItemStatus.isPending}
                    data-testid={`button-back-item-${item.id}`}
                  >
                    إعادة لمقبول
                  </Button>
                </>
              )}
              {itemSt === 'rejected' && (
                <Button
                  size="sm" variant="outline"
                  className="text-xs gap-1"
                  onClick={() => handleItemStatusChange(item.id, 'pending')}
                  disabled={updateItemStatus.isPending}
                  data-testid={`button-reaccept-item-${item.id}`}
                >
                  <Check className="h-3 w-3" />
                  إعادة للانتظار
                </Button>
              )}
              {itemSt === 'completed' && (
                <Button
                  size="sm" variant="ghost"
                  className="text-xs gap-1 text-slate-500"
                  onClick={() => handleItemStatusChange(item.id, 'in_progress')}
                  disabled={updateItemStatus.isPending}
                  data-testid={`button-back-completed-item-${item.id}`}
                >
                  إعادة لقيد الإنجاز
                </Button>
              )}
              {(itemSt === 'accepted' || itemSt === 'in_progress' || itemSt === 'completed') && (
                <Button
                  size="sm" variant="outline"
                  className="gap-1 text-[10px] border-blue-300 text-blue-700 mr-auto"
                  onClick={() => setPrintItem({ order, item })}
                  data-testid={`button-print-item-${item.id}`}
                >
                  <Printer className="h-3 w-3" />
                  طباعة أمر ورشة
                </Button>
              )}
              <Button
                size="sm" variant="outline"
                className="gap-1 text-[10px] border-orange-300 text-orange-700"
                onClick={() => {
                  const allowed = ['pending', 'accepted', 'in_progress', 'completed'];
                  setCorrectingItem(item.id);
                  setCorrectStatus(allowed.includes(itemSt) ? itemSt : 'pending');
                }}
                data-testid={`button-correct-item-${item.id}`}
              >
                <Pencil className="h-3 w-3" />
                تصحيح الحالة
              </Button>
            </div>
          )}

          {correctingItem === item.id && (
            <div className="pt-2 border-t border-orange-200 bg-orange-50/50 rounded-lg p-3 space-y-3">
              <p className="text-xs font-bold text-orange-800">تصحيح حالة الصنف</p>
              <Select value={correctStatus} onValueChange={setCorrectStatus}>
                <SelectTrigger className="text-xs" data-testid={`select-correct-status-${item.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="accepted">مقبول</SelectItem>
                  <SelectItem value="in_progress">قيد الإنجاز</SelectItem>
                  <SelectItem value="completed">منجز</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  size="sm" className="gap-1 text-xs"
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
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900" data-testid="text-page-title">إدارة الطلبات</h1>
            <p className="text-slate-500">قبول ورفض الأصناف وإدارة حالة الإنتاج</p>
          </div>

          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالمنتج، الكود، الفرع، أو رقم الطلب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9 max-w-md"
              data-testid="input-search-orders"
            />
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
