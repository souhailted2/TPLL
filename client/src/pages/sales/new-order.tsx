import { Sidebar } from "@/components/layout-sidebar";
import { useProducts } from "@/hooks/use-products";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ShoppingCart, Trash2, Search, X, Package, Weight } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type UnitType = "piece" | "bag";

interface CartItem {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unit: UnitType;
}

export default function NewOrder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: productsData, isLoading: productsLoading } = useProducts({ 
    search: debouncedSearch, 
    limit: 100 
  });
  const { mutateAsync: createOrder, isPending: isSubmitting } = useCreateOrder();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const products = productsData?.products || [];

  const addToCart = (product: any, unit: UnitType = "piece") => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id && item.unit === unit);
      if (existing) {
        return prev.map(item => 
          (item.productId === product.id && item.unit === unit)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        productName: product.name,
        productSku: product.sku,
        quantity: 1,
        unit
      }];
    });
  };

  const removeFromCart = (productId: number, unit: UnitType) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.unit === unit)));
  };

  const updateQuantity = (productId: number, unit: UnitType, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(item => 
      (item.productId === productId && item.unit === unit) ? { ...item, quantity: qty } : item
    ));
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    
    try {
      await createOrder({
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit
        }))
      });
      
      toast({
        title: "تم إرسال الطلب",
        description: "تم إرسال طلبك إلى المصنع بنجاح",
      });
      setCart([]);
      setCartOpen(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="sales_point" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 h-screen flex flex-col">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row flex-wrap justify-between items-center gap-2">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">طلب جديد</h1>
                <p className="text-slate-500">اختر المنتجات وأضفها للسلة</p>
              </div>
            </div>
            
            <div className="relative w-full z-10">
              <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="بحث بالاسم أو الكود..." 
                className="pr-9 bg-white border-slate-300 shadow-sm text-base h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-product"
              />
            </div>
          </div>

          {/* Products Grid - Full Width */}
          <div className="flex-1 overflow-y-auto pl-0 lg:pl-80">
            {productsLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products?.map((product) => (
                  <Card 
                    key={product.id} 
                    className="hover:border-primary transition-colors"
                    data-testid={`card-product-${product.id}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900">{product.name}</h3>
                          <p className="text-xs text-slate-400">{product.sku}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="min-w-[70px] gap-1 text-xs"
                          onClick={() => addToCart(product, "piece")}
                          data-testid={`button-add-piece-${product.id}`}
                        >
                          <Package className="h-3 w-3 shrink-0" />
                          <span>قطعة</span>
                        </Button>
                        {!product.name.includes("Tige Filetée") && (
                          <Button 
                            size="sm" 
                            className="min-w-[70px] gap-1 text-xs"
                            onClick={() => addToCart(product, "bag")}
                            data-testid={`button-add-bag-${product.id}`}
                          >
                            <Weight className="h-3 w-3 shrink-0" />
                            <span>شكارة</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Cart Toggle Button */}
          <Button
            onClick={() => setCartOpen(true)}
            className={cn(
              "lg:hidden fixed bottom-4 left-4 z-50 h-14 w-14 rounded-full shadow-xl",
              cartOpen && "opacity-0 invisible"
            )}
            size="icon"
            data-testid="button-open-cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Button>

          {/* Cart Overlay for Mobile */}
          {cartOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setCartOpen(false)}
            />
          )}

          {/* Cart Sidebar - Fixed Position */}
          <div className={cn(
            "fixed top-0 left-0 w-80 h-screen bg-white border-l border-slate-200 shadow-xl flex flex-col z-50 transition-all duration-300",
            cartOpen ? "opacity-100 visible" : "opacity-0 invisible lg:opacity-100 lg:visible"
          )}>
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span className="font-bold">سلة الطلبات</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{cart.length} منتج</Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden h-8 w-8"
                  onClick={() => setCartOpen(false)}
                  data-testid="button-close-cart"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-8">
                  <ShoppingCart className="h-12 w-12 opacity-20" />
                  <p>السلة فارغة</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={`${item.productId}-${item.unit}`} className="bg-slate-50 p-3 rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-900">{item.productName}</p>
                        <p className="text-xs text-slate-400">{item.productSku}</p>
                      </div>
                      <Badge variant={item.unit === "bag" ? "default" : "outline"} className="text-xs">
                        {item.unit === "bag" ? "شكارة 25 كغ" : "قطعة"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, item.unit, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Input 
                          type="number" 
                          className="w-14 h-7 text-center px-1" 
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, item.unit, parseInt(e.target.value) || 1)}
                          data-testid={`input-quantity-${item.productId}-${item.unit}`}
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, item.unit, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" 
                        onClick={() => removeFromCart(item.productId, item.unit)}
                        data-testid={`button-remove-${item.productId}-${item.unit}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>إجمالي المنتجات</span>
                <span className="font-bold">{totalItems} وحدة</span>
              </div>
              <Button 
                onClick={handleSubmitOrder} 
                className="w-full py-4 text-base shadow-lg shadow-primary/20"
                disabled={cart.length === 0 || isSubmitting}
                data-testid="button-submit-order"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "إرسال الطلب للمصنع"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
