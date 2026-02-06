import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus, useUpdateCompletedQuantity } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronUp, Package, Check, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ReceptionOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const updateCompleted = useUpdateCompletedQuantity();
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('pending');
  const [completedQuantities, setCompletedQuantities] = useState<Record<number, number>>({});
  const { toast } = useToast();

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    switch (activeFilter) {
      case 'pending':
        return orders.filter((o: any) => o.status === 'submitted');
      case 'accepted':
        return orders.filter((o: any) => o.status === 'accepted' || o.status === 'in_progress');
      case 'completed':
        return orders.filter((o: any) => o.status === 'completed');
      case 'rejected':
        return orders.filter((o: any) => o.status === 'rejected');
      default:
        return orders;
    }
  }, [orders, activeFilter]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
      toast({ title: "تم التحديث", description: `تم تغيير حالة الطلب #${orderId}` });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleCompletedQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateCompleted.mutateAsync({ itemId, completedQuantity: quantity });
      toast({ title: "تم التحديث", description: "تم تحديث الكمية المنجزة" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
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

  const getUnitLabel = (unit: string) => {
    return unit === 'bag' ? 'شكارة 25 كغ' : 'قطعة';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="reception" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900" data-testid="text-page-title">إدارة الطلبات</h1>
            <p className="text-slate-500">استقبال وإدارة طلبات نقاط البيع</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'pending', label: 'في الانتظار', count: orders?.filter((o: any) => o.status === 'submitted').length || 0 },
              { key: 'accepted', label: 'قيد العمل', count: orders?.filter((o: any) => o.status === 'accepted' || o.status === 'in_progress').length || 0 },
              { key: 'completed', label: 'منجزة', count: orders?.filter((o: any) => o.status === 'completed').length || 0 },
              { key: 'rejected', label: 'مرفوضة', count: orders?.filter((o: any) => o.status === 'rejected').length || 0 },
              { key: 'all', label: 'الكل', count: orders?.length || 0 },
            ].map(f => (
              <Button 
                key={f.key}
                variant={activeFilter === f.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(f.key)}
                data-testid={`filter-${f.key}`}
              >
                {f.label} ({f.count})
              </Button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
            {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>نقطة البيع</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المنتجات</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders?.map((order: any) => (
                      <>
                        <TableRow key={order.id}>
                          <TableCell className="font-mono font-bold" data-testid={`text-order-id-${order.id}`}>#{order.id}</TableCell>
                          <TableCell className="font-bold" data-testid={`text-sales-point-${order.id}`}>
                            {order.salesPoint?.salesPointName || order.salesPoint?.firstName}
                          </TableCell>
                          <TableCell>
                            {order.createdAt && format(new Date(order.createdAt), 'PP p', { locale: arSA })}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" size="sm" className="gap-2"
                              onClick={() => toggleOrder(order.id)}
                              data-testid={`button-toggle-order-${order.id}`}
                            >
                              <Package className="h-4 w-4" />
                              {order.items?.length || 0} صنف
                              {expandedOrders.includes(order.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end flex-wrap">
                              {order.status === 'submitted' && (
                                <>
                                  <Button 
                                    size="sm" variant="default"
                                    onClick={() => handleStatusChange(order.id, 'accepted')}
                                    disabled={updateStatus.isPending}
                                    data-testid={`button-accept-${order.id}`}
                                  >
                                    <Check className="h-4 w-4 ml-1" />
                                    قبول
                                  </Button>
                                  <Button 
                                    size="sm" variant="destructive"
                                    onClick={() => handleStatusChange(order.id, 'rejected')}
                                    disabled={updateStatus.isPending}
                                    data-testid={`button-reject-${order.id}`}
                                  >
                                    <XIcon className="h-4 w-4 ml-1" />
                                    رفض
                                  </Button>
                                </>
                              )}
                              {order.status === 'accepted' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleStatusChange(order.id, 'in_progress')}
                                  disabled={updateStatus.isPending}
                                  data-testid={`button-start-${order.id}`}
                                >
                                  بدء الإنجاز
                                </Button>
                              )}
                              {order.status === 'in_progress' && (
                                <Button 
                                  size="sm" variant="default"
                                  onClick={() => handleStatusChange(order.id, 'completed')}
                                  disabled={updateStatus.isPending}
                                  data-testid={`button-complete-${order.id}`}
                                >
                                  <Check className="h-4 w-4 ml-1" />
                                  تم الإنجاز
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedOrders.includes(order.id) && order.items && order.items.length > 0 && (
                          <TableRow key={`${order.id}-details`}>
                            <TableCell colSpan={6} className="bg-slate-50 p-4">
                              <div className="space-y-2">
                                <p className="font-bold text-sm mb-3">تفاصيل الطلب:</p>
                                <div className="grid gap-2">
                                  {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border gap-4">
                                      <div className="flex-1">
                                        <p className="font-medium">{item.product?.name}</p>
                                        <p className="text-xs text-slate-400">{item.product?.sku}</p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Badge variant={item.unit === 'bag' ? 'default' : 'outline'}>
                                          {getUnitLabel(item.unit || 'piece')}
                                        </Badge>
                                        <span className="font-bold text-primary text-lg">{item.quantity}</span>
                                        {(order.status === 'in_progress' || order.status === 'completed') && (
                                          <div className="flex items-center gap-2 border-r pr-3">
                                            <span className="text-xs text-slate-500">منجز:</span>
                                            <Input
                                              type="number"
                                              min={0}
                                              max={item.quantity}
                                              value={completedQuantities[item.id] ?? item.completedQuantity ?? 0}
                                              onChange={(e) => setCompletedQuantities(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                                              className="w-20 h-8 text-center"
                                              data-testid={`input-completed-${item.id}`}
                                            />
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleCompletedQuantity(item.id, completedQuantities[item.id] ?? item.completedQuantity ?? 0)}
                                              disabled={updateCompleted.isPending}
                                              data-testid={`button-save-completed-${item.id}`}
                                            >
                                              حفظ
                                            </Button>
                                          </div>
                                        )}
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
                    {filteredOrders?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                          لا توجد طلبات
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
