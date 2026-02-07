import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ChevronDown, ChevronUp, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ShippingOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ready');
  const { toast } = useToast();

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    switch (activeFilter) {
      case 'ready': return orders.filter((o: any) => o.status === 'completed');
      case 'shipped': return orders.filter((o: any) => o.status === 'shipped');
      case 'received': return orders.filter((o: any) => o.status === 'received');
      default: return orders.filter((o: any) => ['completed', 'shipped', 'received'].includes(o.status));
    }
  }, [orders, activeFilter]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };

  const handleShip = async (orderId: number) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: 'shipped' });
      toast({ title: "تم الشحن", description: `تم شحن الطلب #${orderId}` });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-teal-100 text-teal-800';
      default: return 'bg-amber-100 text-orange-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'جاهز للشحن';
      case 'shipped': return 'تم الشحن';
      case 'received': return 'تم الاستلام';
      default: return status;
    }
  };

  const getUnitLabel = (unit: string) => {
    return unit === 'bag' ? 'شكارة 25 كغ' : 'قطعة';
  };

  const renderMobileCards = () => (
    <div className="lg:hidden space-y-3">
      {filteredOrders?.map((order: any) => (
        <Card key={order.id} data-testid={`card-order-${order.id}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-lg" data-testid={`text-order-id-${order.id}`}>#{order.id}</span>
              <Badge variant="secondary" className={getStatusColor(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-bold text-slate-700" data-testid={`text-sales-point-${order.id}`}>
                {order.salesPoint?.salesPointName || order.salesPoint?.firstName}
              </span>
              <span className="text-xs text-slate-400">
                {order.createdAt && format(new Date(order.createdAt), 'PP', { locale: arSA })}
              </span>
            </div>

            {order.status === 'completed' && (
              <Button 
                size="sm" className="w-full gap-2"
                onClick={() => handleShip(order.id)}
                disabled={updateStatus.isPending}
                data-testid={`button-ship-${order.id}`}
              >
                <Truck className="h-4 w-4" />
                شحن
              </Button>
            )}
            {order.status === 'shipped' && (
              <p className="text-sm text-slate-400 text-center">في الطريق</p>
            )}
            {order.status === 'received' && (
              <p className="text-sm text-green-600 text-center">تم التسليم</p>
            )}

            {order.items && order.items.length > 0 && (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="font-bold text-sm">تفاصيل الطلب:</p>
                <div className="grid gap-2">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg border bg-slate-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm break-words">{item.product?.name}</p>
                          <p className="text-[10px] text-slate-400">{item.product?.sku}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={item.unit === 'bag' ? 'default' : 'outline'} className="text-[10px]">
                            {getUnitLabel(item.unit || 'piece')}
                          </Badge>
                          <div className="text-left">
                            <span className="font-bold text-primary">{item.completedQuantity || 0}</span>
                            <span className="text-xs text-slate-400 mr-1">/ {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {filteredOrders?.length === 0 && (
        <div className="text-center py-12 text-slate-400">لا توجد طلبات</div>
      )}
    </div>
  );

  const renderDesktopTable = () => (
    <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
      <div className="min-w-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>نقطة البيع</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>المنتجات</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراء</TableHead>
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
                    <Button variant="ghost" size="sm" className="gap-2"
                      onClick={() => toggleOrder(order.id)} data-testid={`button-toggle-order-${order.id}`}>
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
                    <div className="flex justify-end">
                      {order.status === 'completed' && (
                        <Button size="sm" onClick={() => handleShip(order.id)} disabled={updateStatus.isPending} data-testid={`button-ship-${order.id}`}>
                          <Truck className="h-4 w-4 ml-1" />
                          شحن
                        </Button>
                      )}
                      {order.status === 'shipped' && <span className="text-sm text-slate-400">في الطريق</span>}
                      {order.status === 'received' && <span className="text-sm text-green-600">تم التسليم</span>}
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
                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                              <div className="flex-1">
                                <p className="font-medium">{item.product?.name}</p>
                                <p className="text-xs text-slate-400">{item.product?.sku}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge variant={item.unit === 'bag' ? 'default' : 'outline'}>
                                  {getUnitLabel(item.unit || 'piece')}
                                </Badge>
                                <div className="text-left">
                                  <span className="font-bold text-primary text-lg">{item.completedQuantity || 0}</span>
                                  <span className="text-xs text-slate-400 mr-1">/ {item.quantity}</span>
                                </div>
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
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">لا توجد طلبات</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="shipping" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900" data-testid="text-page-title">إدارة الشحن</h1>
            <p className="text-slate-500">شحن الطلبات المنجزة إلى نقاط البيع</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'ready', label: 'جاهز للشحن', count: orders?.filter((o: any) => o.status === 'completed').length || 0 },
              { key: 'shipped', label: 'تم الشحن', count: orders?.filter((o: any) => o.status === 'shipped').length || 0 },
              { key: 'received', label: 'تم الاستلام', count: orders?.filter((o: any) => o.status === 'received').length || 0 },
              { key: 'all', label: 'الكل', count: orders?.filter((o: any) => ['completed', 'shipped', 'received'].includes(o.status)).length || 0 },
            ].map(f => (
              <Button key={f.key} variant={activeFilter === f.key ? 'default' : 'outline'} size="sm"
                onClick={() => setActiveFilter(f.key)} data-testid={`filter-${f.key}`}>
                {f.label} ({f.count})
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <>
              {renderMobileCards()}
              {renderDesktopTable()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
