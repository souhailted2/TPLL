import { Sidebar } from "@/components/layout-sidebar";
import { useOrders, useUpdateCompletedQuantity, useShipItem } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Truck, Send, ClipboardCheck, ArrowDownToLine, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMaghrebDate } from "@/lib/queryClient";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedCard } from "@/components/animated-card";

export default function ShippingOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateCompleted = useUpdateCompletedQuantity();
  const shipItem = useShipItem();
  const [activeTab, setActiveTab] = useState<string>('receive');
  const [completedQuantities, setCompletedQuantities] = useState<Record<number, number>>({});
  const [shipQuantities, setShipQuantities] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const searchActive = searchTerm.trim() !== "";

  const handleCompletedQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateCompleted.mutateAsync({ itemId, completedQuantity: quantity });
      toast({ title: "تم التحديث", description: "تم تحديث الكمية المستلمة من المصنع" });
      setCompletedQuantities(prev => ({ ...prev, [itemId]: 0 }));
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleShipItem = async (itemId: number, quantity: number) => {
    try {
      await shipItem.mutateAsync({ itemId, shippedQuantity: quantity });
      toast({ title: "تم الشحن", description: "تم شحن الكمية بنجاح" });
      setShipQuantities(prev => ({ ...prev, [itemId]: 0 }));
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
      case 'accepted': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-teal-100 text-teal-800';
      default: return 'bg-amber-100 text-orange-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
      case 'accepted': return 'قيد الإنجاز';
      case 'completed': return 'مكتمل';
      case 'shipped': return 'تم الشحن';
      case 'received': return 'تم الاستلام';
      default: return status;
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

  const receiveFlatItems = useMemo(() =>
    allFlatItems.filter(({ item, order }) =>
      ['accepted', 'in_progress', 'completed'].includes(order.status) &&
      ['accepted', 'in_progress', 'completed'].includes(item.itemStatus || 'pending')
    ), [allFlatItems]
  );

  const readyFlatItems = useMemo(() =>
    allFlatItems.filter(({ item, order }) => {
      const completed = item.completedQuantity || 0;
      const shipped = item.shippedQuantity || 0;
      return completed > shipped &&
        ['accepted', 'in_progress', 'completed'].includes(order.status) &&
        ['accepted', 'in_progress', 'completed'].includes(item.itemStatus || 'pending');
    }), [allFlatItems]
  );

  const shippedFlatItems = useMemo(() =>
    allFlatItems.filter(({ item, order }) =>
      order.status === 'shipped' || (item.shippedQuantity || 0) > 0
    ), [allFlatItems]
  );

  const receivedFlatItems = useMemo(() =>
    allFlatItems.filter(({ item, order }) =>
      order.status === 'received' || (item.itemStatus || 'pending') === 'received'
    ), [allFlatItems]
  );

  const matchesSearch = ({ item, order }: { item: any; order: any }) => {
    if (!searchActive) return true;
    const term = searchTerm.trim().toLowerCase();
    return (
      String(order.id).includes(term) ||
      (order.salesPoint?.salesPointName || order.salesPoint?.firstName || '').toLowerCase().includes(term) ||
      (item.product?.name || '').toLowerCase().includes(term) ||
      (item.product?.sku || '').toLowerCase().includes(term)
    );
  };

  const renderReceiveCard = ({ item, order }: { item: any; order: any }) => {
    const maxAllowed = Math.ceil(item.quantity * 1.5);
    const currentCompleted = item.completedQuantity || 0;
    const completedPct = Math.min(Math.round((currentCompleted / (item.quantity || 1)) * 100), 100);

    return (
      <Card key={`receive-${order.id}-${item.id}`} className="overflow-hidden bg-white border border-slate-200 border-l-4 border-l-blue-500 shadow-md" data-testid={`card-item-${item.id}`}>
        <CardHeader className="bg-blue-50 px-4 py-3 space-y-1 border-b border-blue-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ArrowDownToLine className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="font-bold text-sm text-slate-800" data-testid={`text-order-ref-${item.id}`}>
                طلب #{order.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-sm text-slate-700 truncate">
                {order.salesPoint?.salesPointName || order.salesPoint?.firstName}
              </span>
            </div>
            <Badge variant="secondary" className={`text-[10px] shrink-0 ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">{order.createdAt && formatMaghrebDate(order.createdAt)}</span>
            <Badge variant="secondary" className={`text-[10px] ${getItemStatusColor(item.itemStatus)}`}>
              {getItemStatusLabel(item.itemStatus)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-3 space-y-3">
          <div className="space-y-1">
            <p className="font-bold text-base text-slate-900 leading-tight" data-testid={`text-item-name-${item.id}`}>
              {item.product?.name}
            </p>
            <p className="text-xs text-slate-400 font-mono">{item.product?.sku}</p>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
            <span className="text-xs text-slate-500">الكمية المطلوبة</span>
            <span className="font-bold text-slate-800 text-sm">{item.quantity} {getUnitLabel(item.unit || 'piece')}</span>
          </div>

          {currentCompleted > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">المستلم من المصنع</span>
                <span className="font-semibold text-blue-700">{currentCompleted} / {item.quantity} <span className="text-slate-400">({completedPct}%)</span></span>
              </div>
              <Progress value={completedPct} className="h-2 bg-slate-200 [&>div]:bg-blue-500" />
            </div>
          )}

          <div className="text-xs text-slate-500 bg-orange-50 rounded px-2 py-1">
            الحد الأقصى للاستلام: <span className="font-bold text-orange-600">{maxAllowed}</span>
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 border-t border-blue-100 flex items-center gap-2">
          <span className="text-xs text-blue-600 shrink-0 font-medium">إضافة كمية:</span>
          <Input
            type="number" min={0}
            max={maxAllowed - currentCompleted}
            value={completedQuantities[item.id] !== undefined ? (completedQuantities[item.id] === 0 ? '' : completedQuantities[item.id]) : ''}
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : Number(e.target.value);
              const remaining = maxAllowed - currentCompleted;
              if (val >= 0 && val <= remaining) {
                setCompletedQuantities(prev => ({ ...prev, [item.id]: val }));
              }
            }}
            placeholder="0"
            className="w-20 text-center"
            data-testid={`input-completed-${item.id}`}
          />
          <Button
            size="sm" variant="default" className="flex-1 gap-1"
            onClick={() => {
              const newQty = completedQuantities[item.id] || 0;
              if (newQty > 0) handleCompletedQuantity(item.id, currentCompleted + newQty);
            }}
            disabled={updateCompleted.isPending || !(completedQuantities[item.id] > 0)}
            data-testid={`button-save-completed-${item.id}`}
          >
            <ClipboardCheck className="h-4 w-4" />
            تأكيد الاستلام
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderShipCard = ({ item, order }: { item: any; order: any }) => {
    const currentCompleted = item.completedQuantity || 0;
    const currentShipped = item.shippedQuantity || 0;
    const shippable = currentCompleted - currentShipped;
    const totalQty = item.quantity || 1;
    const completedPct = Math.min(Math.round((currentCompleted / totalQty) * 100), 100);
    const shippedPct = Math.min(Math.round((currentShipped / totalQty) * 100), 100);

    return (
      <Card key={`ship-${order.id}-${item.id}`} className="overflow-hidden bg-white border border-slate-200 border-l-4 border-l-purple-500 shadow-md" data-testid={`card-item-${item.id}`}>
        <CardHeader className="bg-purple-50 px-4 py-3 space-y-1 border-b border-purple-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Truck className="h-4 w-4 text-purple-600 shrink-0" />
              <span className="font-bold text-sm text-slate-800" data-testid={`text-order-ref-${item.id}`}>
                طلب #{order.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-sm text-slate-700 truncate">
                {order.salesPoint?.salesPointName || order.salesPoint?.firstName}
              </span>
            </div>
            <Badge variant="secondary" className={`text-[10px] shrink-0 ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <span className="text-xs text-slate-400">{order.createdAt && formatMaghrebDate(order.createdAt)}</span>
        </CardHeader>

        <CardContent className="px-4 py-3 space-y-3">
          <div className="space-y-1">
            <p className="font-bold text-base text-slate-900 leading-tight" data-testid={`text-item-name-${item.id}`}>
              {item.product?.name}
            </p>
            <p className="text-xs text-slate-400 font-mono">{item.product?.sku}</p>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
            <span className="text-xs text-slate-500">الكمية المطلوبة</span>
            <span className="font-bold text-slate-800 text-sm">{item.quantity} {getUnitLabel(item.unit || 'piece')}</span>
          </div>

          <div className="space-y-1.5">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">المنجز</span>
                <span className="font-semibold text-emerald-700">{currentCompleted} / {totalQty} <span className="text-slate-400">({completedPct}%)</span></span>
              </div>
              <Progress value={completedPct} className="h-2 bg-slate-200 [&>div]:bg-emerald-500" />
            </div>
            {currentShipped > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">تم الشحن</span>
                  <span className="font-semibold text-purple-700">{currentShipped} / {totalQty} <span className="text-slate-400">({shippedPct}%)</span></span>
                </div>
                <Progress value={shippedPct} className="h-2 bg-slate-200 [&>div]:bg-purple-500" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
            <span className="text-xs text-purple-700 font-medium">متاح للشحن الآن</span>
            <span className="font-bold text-purple-800 text-sm">{shippable} {getUnitLabel(item.unit || 'piece')}</span>
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 border-t border-purple-100 flex items-center gap-2">
          <Send className="h-4 w-4 text-purple-600 shrink-0" />
          <Input
            type="number" min={1} max={shippable}
            value={shipQuantities[item.id] !== undefined ? (shipQuantities[item.id] === 0 ? '' : shipQuantities[item.id]) : ''}
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : Number(e.target.value);
              if (val >= 0 && val <= shippable) {
                setShipQuantities(prev => ({ ...prev, [item.id]: val }));
              }
            }}
            placeholder={`1 - ${shippable}`}
            className="w-24 text-center"
            data-testid={`input-ship-${item.id}`}
          />
          <Button
            size="sm" className="flex-1 gap-1 bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              const qty = shipQuantities[item.id] || 0;
              if (qty > 0 && qty <= shippable) handleShipItem(item.id, currentShipped + qty);
            }}
            disabled={shipItem.isPending || !(shipQuantities[item.id] > 0)}
            data-testid={`button-ship-item-${item.id}`}
          >
            <Truck className="h-4 w-4" />
            شحن
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderHistoryCard = ({ item, order }: { item: any; order: any }) => {
    if ((item.itemStatus || 'pending') === 'rejected') return null;
    const completedQty = item.completedQuantity || 0;
    const shippedQty = item.shippedQuantity || 0;
    const totalQty = item.quantity || 1;
    const completedPct = Math.min(Math.round((completedQty / totalQty) * 100), 100);
    const shippedPct = Math.min(Math.round((shippedQty / totalQty) * 100), 100);
    const isReceived = order.status === 'received' || (item.itemStatus || 'pending') === 'received';

    return (
      <Card
        key={`hist-${order.id}-${item.id}`}
        className={`overflow-hidden bg-white border border-slate-200 border-l-4 ${isReceived ? 'border-l-teal-500' : 'border-l-purple-400'} shadow-md`}
        data-testid={`card-item-${item.id}`}
      >
        <CardHeader className={`${isReceived ? 'bg-teal-50' : 'bg-slate-50'} px-4 py-3 space-y-1 border-b border-slate-200`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm text-slate-800">طلب #{order.id}</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-sm text-slate-700 truncate">
                {order.salesPoint?.salesPointName || order.salesPoint?.firstName}
              </span>
            </div>
            <Badge variant="secondary" className={`text-[10px] shrink-0 ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <span className="text-xs text-slate-400">{order.createdAt && formatMaghrebDate(order.createdAt)}</span>
        </CardHeader>

        <CardContent className="px-4 py-3 space-y-3">
          <div className="space-y-1">
            <p className="font-bold text-base text-slate-900 leading-tight">{item.product?.name}</p>
            <p className="text-xs text-slate-400 font-mono">{item.product?.sku}</p>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
            <span className="text-xs text-slate-500">الكمية المطلوبة</span>
            <span className="font-bold text-slate-800 text-sm">{item.quantity} {getUnitLabel(item.unit || 'piece')}</span>
          </div>

          <div className="space-y-1.5">
            {completedQty > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">الإنجاز</span>
                  <span className="font-semibold text-emerald-700">{completedQty} / {totalQty} <span className="text-slate-400">({completedPct}%)</span></span>
                </div>
                <Progress value={completedPct} className="h-2 bg-slate-200 [&>div]:bg-emerald-500" />
              </div>
            )}
            {shippedQty > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{isReceived ? 'تم الاستلام' : 'الشحن'}</span>
                  <span className={`font-semibold ${isReceived ? 'text-teal-700' : 'text-purple-700'}`}>
                    {shippedQty} / {totalQty} <span className="text-slate-400">({shippedPct}%)</span>
                  </span>
                </div>
                <Progress value={shippedPct} className={`h-2 bg-slate-200 ${isReceived ? '[&>div]:bg-teal-500' : '[&>div]:bg-purple-500'}`} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const tabs = [
    { key: 'receive', label: 'استلام من المصنع', icon: ArrowDownToLine,
      count: searchActive ? receiveFlatItems.filter(matchesSearch).length : receiveFlatItems.length },
    { key: 'ready', label: 'جاهز للشحن', icon: Truck,
      count: searchActive ? readyFlatItems.filter(matchesSearch).length : readyFlatItems.length },
    { key: 'shipped', label: 'تم الشحن', icon: Send,
      count: searchActive ? shippedFlatItems.filter(matchesSearch).length : shippedFlatItems.length },
    { key: 'received', label: 'تم الاستلام', icon: ArrowDownToLine,
      count: searchActive ? receivedFlatItems.filter(matchesSearch).length : receivedFlatItems.length },
  ];

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (searchActive) {
      const seen = new Set<number>();
      const results: JSX.Element[] = [];
      let idx = 0;
      const addItems = (list: { item: any; order: any }[], renderFn: (e: { item: any; order: any }) => JSX.Element | null) => {
        for (const entry of list) {
          if (!seen.has(entry.item.id) && matchesSearch(entry)) {
            seen.add(entry.item.id);
            const card = renderFn(entry);
            if (card) results.push(
              <AnimatedCard key={entry.item.id} index={idx++}>{card}</AnimatedCard>
            );
          }
        }
      };
      addItems(readyFlatItems, renderShipCard);
      addItems(receiveFlatItems, renderReceiveCard);
      addItems(receivedFlatItems, renderHistoryCard);
      addItems(shippedFlatItems, renderHistoryCard);
      if (results.length === 0) {
        return <div className="col-span-full text-center py-12 text-slate-400">لا توجد نتائج للبحث</div>;
      }
      return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{results}</div>;
    }

    let items: { item: any; order: any }[];
    let renderFn: (e: { item: any; order: any }) => JSX.Element | null;
    switch (activeTab) {
      case 'receive': items = receiveFlatItems; renderFn = renderReceiveCard; break;
      case 'ready': items = readyFlatItems; renderFn = renderShipCard; break;
      case 'shipped': items = shippedFlatItems; renderFn = renderHistoryCard; break;
      case 'received': items = receivedFlatItems; renderFn = renderHistoryCard; break;
      default: items = []; renderFn = renderHistoryCard;
    }
    const rendered = items.map((entry, i) => {
      const card = renderFn(entry);
      if (!card) return null;
      return <AnimatedCard key={`${entry.order.id}-${entry.item.id}`} index={i}>{card}</AnimatedCard>;
    }).filter(Boolean) as JSX.Element[];
    if (rendered.length === 0) {
      return <div className="col-span-full text-center py-12 text-slate-400">لا توجد طلبات</div>;
    }
    return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{rendered}</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="shipping" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900" data-testid="text-page-title">إدارة الشحن</h1>
            <p className="text-slate-500 text-sm">استلام البضائع من المصنع وشحنها إلى نقاط البيع</p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="بحث في جميع التبويبات: المنتج، الكود، الفرع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9 pl-9"
              data-testid="input-search-orders"
            />
            {searchActive && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-clear-search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!searchActive && (
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <Button key={tab.key} variant={activeTab === tab.key ? 'default' : 'outline'} size="sm"
                  onClick={() => setActiveTab(tab.key)} data-testid={`filter-${tab.key}`} className="gap-1">
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>
          )}

          {searchActive && (
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <div key={tab.key} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 text-sm">
                  <tab.icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  <span className="font-bold text-primary">({tab.count})</span>
                </div>
              ))}
            </div>
          )}

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
