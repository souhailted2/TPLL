import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, PackageCheck } from "lucide-react";
import { formatMaghrebDate } from "@/lib/queryClient";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function SalesOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<string>('active');

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    switch (activeFilter) {
      case 'active': return orders.filter((order: any) =>
        !['received'].includes(order.status)
      );
      case 'received': return orders.filter((order: any) => order.status === 'received');
      default: return orders;
    }
  }, [orders, activeFilter]);

  const getStatusColor = (status: string) => {
    switch(status) {
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

  const handleConfirmReceived = (orderId: number) => {
    updateStatus.mutate(
      { id: orderId, status: 'received' },
      {
        onSuccess: () => {
          toast({ title: 'تم تأكيد الاستلام بنجاح' });
        },
        onError: () => {
          toast({ title: 'خطأ', description: 'فشل تأكيد الاستلام', variant: 'destructive' });
        },
      }
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
              { key: 'active', label: 'الطلبات النشطة', count: orders?.filter((o: any) => !['received'].includes(o.status)).length || 0 },
              { key: 'received', label: 'تم الاستلام', count: orders?.filter((o: any) => o.status === 'received').length || 0 },
              { key: 'all', label: 'الكل', count: orders?.length || 0 },
            ].map(f => (
              <Button key={f.key} variant={activeFilter === f.key ? 'default' : 'outline'} size="sm"
                onClick={() => setActiveFilter(f.key)} data-testid={`filter-${f.key}`}>
                {f.label} ({f.count})
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : filteredOrders?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
              لا توجد طلبات
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOrders?.map((order: any) => (
                <Card key={order.id} data-testid={`card-order-${order.id}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-lg" data-testid={`text-order-id-${order.id}`}>#{order.id}</span>
                      <Badge variant="secondary" className={getStatusColor(order.status)} data-testid={`badge-status-${order.id}`}>
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

                    {order.status === 'shipped' && (
                      <Button
                        size="sm"
                        className="w-full bg-green-600 text-white gap-2"
                        onClick={() => handleConfirmReceived(order.id)}
                        disabled={updateStatus.isPending}
                        data-testid={`button-confirm-received-${order.id}`}
                      >
                        <PackageCheck className="h-4 w-4" />
                        <span>تأكيد الاستلام</span>
                      </Button>
                    )}

                    {order.items && order.items.length > 0 && (
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          <p className="font-bold text-sm">{order.items.length} أصناف</p>
                        </div>
                        <div className="grid gap-2">
                          {order.items.map((item: any, idx: number) => {
                            const itemSt = item.itemStatus || 'pending';
                            return (
                              <div key={idx} className="flex items-start justify-between bg-slate-50 p-2 rounded-lg border gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm break-words">{item.product?.name}</p>
                                  <p className="text-[10px] text-slate-400">{item.product?.sku}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className={`text-[10px] ${getItemStatusColor(itemSt)}`}>
                                      {getItemStatusLabel(itemSt)}
                                    </Badge>
                                    {item.completedQuantity > 0 && (
                                      <span className="text-[10px] text-green-700">منجز: {item.completedQuantity}</span>
                                    )}
                                    {(item.shippedQuantity || 0) > 0 && (
                                      <span className="text-[10px] text-purple-700">مشحون: {item.shippedQuantity}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Badge variant={item.unit === 'bag' ? 'default' : 'outline'} className="text-[10px]">
                                    {getUnitLabel(item.unit || 'piece')}
                                  </Badge>
                                  <span className="font-bold text-primary">{item.quantity}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
