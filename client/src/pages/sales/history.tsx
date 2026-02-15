import { Sidebar } from "@/components/layout-sidebar";
import { useOrders } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, History } from "lucide-react";
import { formatMaghrebDate } from "@/lib/queryClient";
import { useMemo } from "react";

export default function SalesOrderHistory() {
  const { data: orders, isLoading } = useOrders();

  const completedOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order: any) => 
      order.status === 'received' || order.status === 'completed' || order.status === 'cancelled'
    );
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'received': return 'bg-teal-100 text-teal-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'received': return 'تم الاستلام';
      case 'completed': return 'منجز';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getUnitLabel = (unit: string) => {
    return unit === 'bag' ? 'شكارة 25 كغ' : 'قطعة';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="sales_point" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <History className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-slate-900">سجل الطلبات</h1>
            </div>
            <p className="text-slate-500">الطلبات المكتملة والملغاة</p>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : completedOrders?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
              لا توجد طلبات مكتملة أو ملغاة بعد
            </div>
          ) : (
            <div className="space-y-3">
              {completedOrders?.map((order: any) => (
                <div key={order.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-lg">#{order.id}</span>
                      <Badge variant="secondary" className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm text-slate-500 mb-3">
                      <span>
                        {order.createdAt && formatMaghrebDate(order.createdAt)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{order.items?.length || 0} أصناف</span>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <p className="font-bold text-sm">تفاصيل الطلب:</p>
                        <div className="grid gap-2">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-start justify-between bg-slate-50 p-2 rounded-lg border gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm break-words">{item.product?.name}</p>
                                <p className="text-[10px] text-slate-400">{item.product?.sku}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant={item.unit === 'bag' ? 'default' : 'outline'} className="text-[10px]">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
