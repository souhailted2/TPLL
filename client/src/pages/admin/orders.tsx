import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import React, { useState, useMemo } from "react";
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
        return orders.filter(o => o.status === 'submitted' || o.status === 'processing');
      case 'completed':
        return orders.filter(o => o.status === 'completed');
      case 'shipped':
        return orders.filter(o => o.status === 'shipped');
      case 'cancelled':
        return orders.filter(o => o.status === 'cancelled');
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

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatus.mutate({ id: orderId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'processing': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'shipped': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-amber-100 text-orange-800 hover:bg-orange-100';
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

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="admin" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">سجل الطلبات</h1>
            <p className="text-slate-500">متابعة وتحديث حالات طلبات الفروع</p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('all')}
              data-testid="filter-all"
            >
              الكل ({orders?.length || 0})
            </Button>
            <Button 
              variant={activeFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('pending')}
              data-testid="filter-pending"
            >
              قيد المعالجة ({orders?.filter(o => o.status === 'submitted' || o.status === 'processing').length || 0})
            </Button>
            <Button 
              variant={activeFilter === 'shipped' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('shipped')}
              data-testid="filter-shipped"
            >
              تم الشحن ({orders?.filter(o => o.status === 'shipped').length || 0})
            </Button>
            <Button 
              variant={activeFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('completed')}
              data-testid="filter-completed"
            >
              مكتمل ({orders?.filter(o => o.status === 'completed').length || 0})
            </Button>
            <Button 
              variant={activeFilter === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('cancelled')}
              data-testid="filter-cancelled"
            >
              ملغي ({orders?.filter(o => o.status === 'cancelled').length || 0})
            </Button>
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
                    <TableHead className="text-left">تحديث الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders?.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow>
                        <TableCell className="font-mono font-bold">#{order.id}</TableCell>
                        <TableCell className="font-bold">{order.salesPoint?.salesPointName || order.salesPoint?.firstName}</TableCell>
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
                        <TableCell>
                          <div className="flex justify-end">
                            <select 
                              value={order.status} 
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={updateStatus.isPending}
                              className="w-[140px] h-8 px-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                              data-testid={`select-status-${order.id}`}
                              dir="rtl"
                            >
                              <option value="submitted">في الانتظار</option>
                              <option value="processing">قيد الانجاز</option>
                              <option value="shipped">تم الشحن</option>
                              <option value="completed">تم الاستلام</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedOrders.includes(order.id) && order.items && order.items.length > 0 && (
                        <TableRow>
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
                                      <span className="font-bold text-primary text-lg">{item.quantity}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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
