import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus, useDismissOrderAlert, useAdminCorrectItem, useDeleteOrder } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle, BellOff, Pencil, Save, X as XIcon, Search, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatMaghrebDate } from "@/lib/queryClient";
import { useState, useMemo } from "react";
import { useSearch, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const ALERT_DAYS = 15;

function isItemAlert(item: any, order: any): boolean {
  if (order.alertDismissed) return false;
  if (['shipped', 'received', 'rejected', 'submitted'].includes(order.status)) return false;
  if (item.completedQuantity === item.quantity) return false;
  const referenceDate = item.lastCompletedUpdate
    ? new Date(item.lastCompletedUpdate)
    : (order.createdAt ? new Date(order.createdAt) : null);
  if (!referenceDate) return false;
  const daysSince = (new Date().getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= ALERT_DAYS;
}

const adminOrderTransitions: Record<string, { label: string; target: string; color: string }[]> = {
  submitted: [
    { label: 'مقبول', target: 'accepted', color: 'text-emerald-700' },
    { label: 'مرفوض', target: 'rejected', color: 'text-red-700' },
  ],
  accepted: [
    { label: 'قيد الإنجاز', target: 'in_progress', color: 'text-blue-700' },
  ],
  in_progress: [
    { label: 'منجز', target: 'completed', color: 'text-green-700' },
  ],
  completed: [
    { label: 'تم الشحن', target: 'shipped', color: 'text-purple-700' },
  ],
  shipped: [
    { label: 'تم الاستلام', target: 'received', color: 'text-teal-700' },
  ],
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const dismissAlert = useDismissOrderAlert();
  const adminCorrect = useAdminCorrectItem();
  const deleteOrder = useDeleteOrder();
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(searchString);
  const filterParam = searchParams.get('filter');
  const [activeFilter, setActiveFilter] = useState<string>(filterParam || 'all');
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ completedQuantity: number; shippedQuantity: number; itemStatus: string }>({ completedQuantity: 0, shippedQuantity: 0, itemStatus: 'pending' });
  const [searchTerm, setSearchTerm] = useState("");
  const [orderToDelete, setOrderToDelete] = useState<{ id: number } | null>(null);

  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
      const labels: Record<string, string> = {
        accepted: 'تم قبول الطلب', rejected: 'تم رفض الطلب',
        in_progress: 'الطلب قيد الإنجاز', completed: 'تم إنجاز الطلب',
        shipped: 'تم شحن الطلب', received: 'تم استلام الطلب',
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

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'all') setLocation('/admin/orders');
    else setLocation(`/admin/orders?filter=${filter}`);
  };

  const getStatusColor = (status: string) => {
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
      case 'in_progress': return 'قيد الإنجاز';
      case 'completed': return 'تم الإنجاز';
      case 'rejected': return 'مرفوض';
      case 'received': return 'تم الاستلام';
      default: return 'في الانتظار';
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
    switch (activeFilter) {
      case 'pending':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected'].includes(order.status) &&
          ['pending', 'accepted'].includes(item.itemStatus || 'pending')
        );
      case 'in_progress':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) &&
          (item.itemStatus || 'pending') === 'in_progress'
        );
      case 'completed':
        return allFlatItems.filter(({ item, order }) =>
          !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) &&
          (item.itemStatus || 'pending') === 'completed'
        );
      case 'shipped':
        return allFlatItems.filter(({ item, order }) =>
          order.status === 'shipped' || (item.shippedQuantity || 0) > 0
        );
      case 'received':
        return allFlatItems.filter(({ item, order }) =>
          order.status === 'received' || (item.itemStatus || 'pending') === 'received'
        );
      case 'rejected':
        return allFlatItems.filter(({ item, order }) =>
          (item.itemStatus || 'pending') === 'rejected' || order.status === 'rejected'
        );
      case 'alerts':
        return allFlatItems.filter(({ item, order }) => isItemAlert(item, order));
      default:
        return allFlatItems;
    }
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
      case 'pending': return allFlatItems.filter(({ item, order }) =>
        !['shipped', 'received', 'rejected'].includes(order.status) &&
        ['pending', 'accepted'].includes(item.itemStatus || 'pending')
      ).length;
      case 'in_progress': return allFlatItems.filter(({ item, order }) =>
        !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) &&
        (item.itemStatus || 'pending') === 'in_progress'
      ).length;
      case 'completed': return allFlatItems.filter(({ item, order }) =>
        !['shipped', 'received', 'rejected', 'submitted'].includes(order.status) &&
        (item.itemStatus || 'pending') === 'completed'
      ).length;
      case 'shipped': return allFlatItems.filter(({ item, order }) =>
        order.status === 'shipped' || (item.shippedQuantity || 0) > 0
      ).length;
      case 'received': return allFlatItems.filter(({ item, order }) =>
        order.status === 'received' || (item.itemStatus || 'pending') === 'received'
      ).length;
      case 'rejected': return allFlatItems.filter(({ item, order }) =>
        (item.itemStatus || 'pending') === 'rejected' || order.status === 'rejected'
      ).length;
      case 'alerts': return allFlatItems.filter(({ item, order }) => isItemAlert(item, order)).length;
      default: return allFlatItems.length;
    }
  };

  const alertCount = useMemo(() => countByFilter('alerts'), [allFlatItems]);

  const renderItemCard = ({ item, order }: { item: any; order: any }) => {
    const itemSt = item.itemStatus || 'pending';
    const hasAlert = isItemAlert(item, order);
    const orderTransitions = adminOrderTransitions[order.status] || [];
    const isEditing = editingItem === item.id;

    return (
      <Card
        key={`${order.id}-${item.id}`}
        className={hasAlert ? 'border-red-300' : ''}
        data-testid={`card-item-${item.id}`}
      >
        <CardContent className="p-4 space-y-3">
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
              <Badge variant="secondary" className={`text-[10px] ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </Badge>
              {orderTransitions.length > 0 && (
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
              <Button
                size="sm" variant="ghost"
                className="h-6 w-6 p-0 text-slate-300 hover:text-red-600 hover:bg-red-50"
                onClick={() => setOrderToDelete({ id: order.id })}
                data-testid={`button-delete-order-${order.id}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
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

          {!isEditing && (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Badge variant="secondary" className={`text-[10px] ${getItemStatusColor(itemSt)}`}>
                  {getItemStatusLabel(itemSt)}
                </Badge>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">المطلوب: <span className="font-bold">{item.quantity}</span></span>
                  <span className="text-slate-500">المنجز: <span className={`font-bold ${hasAlert ? 'text-red-600' : 'text-green-700'}`}>{item.completedQuantity || 0}</span></span>
                  {(item.shippedQuantity || 0) > 0 && (
                    <span className="text-slate-500">المشحون: <span className="font-bold text-purple-700">{item.shippedQuantity}</span></span>
                  )}
                </div>
              </div>

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

              <div className="pt-1 border-t border-slate-100 flex justify-end">
                <Button
                  size="sm" variant="outline"
                  className="gap-1 text-[10px] border-orange-300 text-orange-700"
                  onClick={() => {
                    setEditingItem(item.id);
                    setEditValues({
                      completedQuantity: item.completedQuantity || 0,
                      shippedQuantity: item.shippedQuantity || 0,
                      itemStatus: itemSt,
                    });
                  }}
                  data-testid={`button-edit-item-${item.id}`}
                >
                  <Pencil className="h-3 w-3" />
                  تصحيح
                </Button>
              </div>
            </>
          )}

          {isEditing && (
            <div className="pt-2 border-t border-orange-200 bg-orange-50/50 rounded-lg p-3 space-y-3">
              <p className="text-xs font-bold text-orange-800">تصحيح الصنف</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">الحالة</label>
                  <Select value={editValues.itemStatus} onValueChange={(v) => setEditValues(prev => ({ ...prev, itemStatus: v }))}>
                    <SelectTrigger className="text-xs" data-testid={`select-status-${item.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">في الانتظار</SelectItem>
                      <SelectItem value="accepted">مقبول</SelectItem>
                      <SelectItem value="in_progress">قيد الإنجاز</SelectItem>
                      <SelectItem value="completed">منجز</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                      <SelectItem value="received">تم الاستلام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">الكمية المستلمة من المصنع</label>
                  <Input
                    type="number" min={0}
                    value={editValues.completedQuantity}
                    onChange={(e) => setEditValues(prev => ({ ...prev, completedQuantity: Number(e.target.value) }))}
                    className="text-xs"
                    data-testid={`input-completed-${item.id}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">الكمية المشحونة</label>
                  <Input
                    type="number" min={0}
                    value={editValues.shippedQuantity}
                    onChange={(e) => setEditValues(prev => ({ ...prev, shippedQuantity: Number(e.target.value) }))}
                    className="text-xs"
                    data-testid={`input-shipped-${item.id}`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm" className="gap-1 text-xs"
                  onClick={async () => {
                    try {
                      const corrections: any = {};
                      if (editValues.completedQuantity !== (item.completedQuantity || 0)) corrections.completedQuantity = editValues.completedQuantity;
                      if (editValues.shippedQuantity !== (item.shippedQuantity || 0)) corrections.shippedQuantity = editValues.shippedQuantity;
                      if (editValues.itemStatus !== itemSt) corrections.itemStatus = editValues.itemStatus;
                      if (Object.keys(corrections).length === 0) { setEditingItem(null); return; }
                      await adminCorrect.mutateAsync({ itemId: item.id, corrections });
                      toast({ title: "تم التصحيح بنجاح" });
                      setEditingItem(null);
                    } catch (err: any) {
                      toast({ title: "خطأ", description: err.message, variant: "destructive" });
                    }
                  }}
                  disabled={adminCorrect.isPending}
                  data-testid={`button-save-correct-${item.id}`}
                >
                  <Save className="h-3 w-3" />
                  حفظ التصحيح
                </Button>
                <Button
                  size="sm" variant="outline" className="gap-1 text-xs"
                  onClick={() => setEditingItem(null)}
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

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <Sidebar role="admin" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold" data-testid="text-page-title">سجل الطلبات</h1>
            <p className="text-slate-500">متابعة وتحديث حالات طلبات الفروع</p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في كل الطلبات: منتج، كود، فرع، أو رقم طلب..."
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
            {[
              { key: 'all', label: 'الكل', count: countByFilter('all') },
              { key: 'pending', label: 'في الانتظار', count: countByFilter('pending') },
              { key: 'in_progress', label: 'قيد العمل', count: countByFilter('in_progress') },
              { key: 'completed', label: 'منجز', count: countByFilter('completed') },
              { key: 'shipped', label: 'تم الشحن', count: countByFilter('shipped') },
              { key: 'received', label: 'تم الاستلام', count: countByFilter('received') },
              { key: 'rejected', label: 'مرفوض', count: countByFilter('rejected') },
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
          ) : searchFilteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">لا توجد طلبات بعد</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {searchFilteredItems.map(renderItemCard)}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الطلب رقم <span className="font-bold text-slate-800">#{orderToDelete?.id}</span>؟
              سيتم حذف جميع أصنافه بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-delete"
              onClick={async () => {
                if (!orderToDelete) return;
                try {
                  await deleteOrder.mutateAsync(orderToDelete.id);
                  toast({ title: "تم الحذف", description: `تم حذف الطلب #${orderToDelete.id} بنجاح` });
                  setOrderToDelete(null);
                } catch (err: any) {
                  toast({ title: "خطأ", description: err.message, variant: "destructive" });
                  setOrderToDelete(null);
                }
              }}
              disabled={deleteOrder.isPending}
            >
              {deleteOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              حذف الطلب
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
