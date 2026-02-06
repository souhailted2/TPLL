import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronUp, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { useState, useMemo } from "react";
import { useSearch, useLocation } from "wouter";

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  
  const searchParams = new URLSearchParams(searchString);
  const filterParam = searchParams.get('filter');
  const [activeFilter, setActiveFilter] = useState<string>(filterParam || 'all');
  
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    switch (activeFilter) {
      case 'pending':
        return orders.filter((o: any) => o.status === 'submitted');
      case 'in_progress':
        return orders.filter((o: any) => o.status === 'accepted' || o.status === 'in_progress');
      case 'completed':
        return orders.filter((o: any) => o.status === 'completed');
      case 'shipped':
        return orders.filter((o: any) => o.status === 'shipped');
      case 'received':
        return orders.filter((o: any) => o.status === 'received');
      case 'rejected':
        return orders.filter((o: any) => o.status === 'rejected');
      default:
        return orders;
    }
  }, [orders, activeFilter]);
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setLocation('/admin/orders');
    } else {
      setLocation(`/admin/orders?filter=${filter}`);
    }
  };

  const toggleOrder = (orderId: number) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
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
      <Sidebar role="admin" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900" data-testid="text-page-title">سجل الطلبات</h1>
            <p className="text-slate-500">متابعة وتحديث حالات طلبات الفروع</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'الكل', count: orders?.length || 0 },
              { key: 'pending', label: 'في الانتظار', count: orders?.filter((o: any) => o.status === 'submitted').length || 0 },
              { key: 'in_progress', label: 'قيد العمل', count: orders?.filter((o: any) => o.status === 'accepted' || o.status === 'in_progress').length || 0 },
              { key: 'completed', label: 'منجز', count: orders?.filter((o: any) => o.status === 'completed').length || 0 },
              { key: 'shipped', label: 'تم الشحن', count: orders?.filter((o: any) => o.status === 'shipped').length || 0 },
              { key: 'received', label: 'تم الاستلام', count: orders?.filter((o: any) => o.status === 'received').length || 0 },
              { key: 'rejected', label: 'مرفوض', count: orders?.filter((o: any) => o.status === 'rejected').length || 0 },
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
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
            {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="min-w-[800px]">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>نقطة البيع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المنتجات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تغيير بواسطة</TableHead>
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
                            variant="ghost" 
                            size="sm"
                            className="gap-2"
                            onClick={() => toggleOrder(order.id)}
                            data-testid={`button-toggle-order-${order.id}`}
                          >
                            <Package className="h-4 w-4" />
                            {order.items?.length || 0} صنف
                            {expandedOrders.includes(order.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-changed-by-${order.id}`}>
                          {order.statusChanger?.firstName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-slate-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{order.statusChanger.firstName}</p>
                                {order.statusChangedAt && (
                                  <p className="text-xs text-slate-400">
                                    {format(new Date(order.statusChangedAt), 'PP p', { locale: arSA })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">-</span>
                          )}
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
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                        لا توجد طلبات بعد
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
