import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ChevronDown, ChevronUp, PackageCheck } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SalesOrders() {
  const { data: orders, isLoading } = useOrders();
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();

  const activeOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order: any) => 
      order.status !== 'completed' && order.status !== 'cancelled'
    );
  }, [orders]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'تم الاستلام';
      case 'processing': return 'قيد الانجاز';
      case 'shipped': return 'تم الشحن';
      case 'cancelled': return 'ملغي';
      default: return 'في الانتظار';
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
            <h1 className="text-3xl font-bold text-slate-900">طلباتي</h1>
            <p className="text-slate-500">سجل الطلبات المرسلة إلى المصنع وحالاتها</p>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : activeOrders?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
              لا توجد طلبات نشطة حالياً
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders?.map((order: any) => (
                <div key={order.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleOrder(order.id)}
                    data-testid={`button-toggle-order-${order.id}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-lg" data-testid={`text-order-id-${order.id}`}>#{order.id}</span>
                      <Badge variant="secondary" className={getStatusColor(order.status)} data-testid={`badge-status-${order.id}`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
                      <span>
                        {order.createdAt && format(new Date(order.createdAt), 'PPP', { locale: arSA })}
                      </span>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{order.items?.length || 0} أصناف</span>
                        {expandedOrders.includes(order.id) ? (
                          <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                      </div>
                    </div>

                    {order.status === 'shipped' && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmReceived(order.id);
                          }}
                          disabled={updateStatus.isPending}
                          data-testid={`button-confirm-received-${order.id}`}
                        >
                          <PackageCheck className="h-4 w-4" />
                          <span>تأكيد الاستلام</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {expandedOrders.includes(order.id) && order.items && order.items.length > 0 && (
                    <div className="border-t border-slate-100 bg-slate-50 p-4">
                      <p className="font-bold text-sm mb-3">تفاصيل الطلب:</p>
                      <div className="grid gap-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.product?.name}</p>
                              <p className="text-xs text-slate-400">{item.product?.sku}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant={item.unit === 'bag' ? 'default' : 'outline'} className="text-xs">
                                {getUnitLabel(item.unit || 'piece')}
                              </Badge>
                              <span className="font-bold text-primary">{item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
