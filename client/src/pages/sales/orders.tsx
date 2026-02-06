import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    return orders.filter(order => 
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
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">طلباتي</h1>
            <p className="text-slate-500">سجل الطلبات المرسلة إلى المصنع وحالاتها</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
            {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="min-w-[600px]">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>عدد الأصناف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراء</TableHead>
                    <TableHead>التفاصيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeOrders?.map((order) => (
                    <>
                      <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono font-bold">#{order.id}</TableCell>
                        <TableCell>
                          {order.createdAt && format(new Date(order.createdAt), 'PPP p', { locale: arSA })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-400" />
                            <span>{order.items?.length || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.status === 'shipped' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white gap-1"
                              onClick={() => handleConfirmReceived(order.id)}
                              disabled={updateStatus.isPending}
                              data-testid={`button-confirm-received-${order.id}`}
                            >
                              <PackageCheck className="h-4 w-4" />
                              <span>تأكيد الاستلام</span>
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleOrder(order.id)}
                            data-testid={`button-toggle-order-${order.id}`}
                          >
                            {expandedOrders.includes(order.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedOrders.includes(order.id) && order.items && order.items.length > 0 && (
                        <TableRow key={`${order.id}-details`}>
                          <TableCell colSpan={6} className="bg-slate-50 p-4">
                            <div className="space-y-2">
                              <p className="font-bold text-sm mb-3">تفاصيل الطلب:</p>
                              <div className="grid gap-2">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                    <div className="flex-1">
                                      <p className="font-medium">{item.product?.name}</p>
                                      <p className="text-xs text-slate-400">{item.product?.sku}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <Badge variant={item.unit === 'bag' ? 'default' : 'outline'}>
                                        {getUnitLabel(item.unit || 'piece')}
                                      </Badge>
                                      <span className="font-bold text-primary">{item.quantity}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                  {activeOrders?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                        لا توجد طلبات نشطة حالياً
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
