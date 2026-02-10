import { Sidebar } from "@/components/layout-sidebar";
import { useProducts } from "@/hooks/use-products";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ShoppingCart, Trash2, Search, X, Package, Weight, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { api } from "@shared/routes";

type UnitType = "piece" | "bag";

interface CartItem {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unit: UnitType;
}

interface QuantityPrompt {
  productId: number;
  productName: string;
  productSku: string;
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
  
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quantityPrompt, setQuantityPrompt] = useState<QuantityPrompt | null>(null);
  const [promptQuantity, setPromptQuantity] = useState("");
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductSku, setNewProductSku] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const newProductNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (quantityPrompt && quantityInputRef.current) {
      quantityInputRef.current.focus();
      quantityInputRef.current.select();
    }
  }, [quantityPrompt]);

  useEffect(() => {
    if (showAddProduct && newProductNameRef.current) {
      newProductNameRef.current.focus();
    }
  }, [showAddProduct]);

  const products = productsData?.products || [];

  const handleAddProduct = async () => {
    if (!newProductName.trim() || !newProductSku.trim()) {
      toast({ title: "يرجى ملء اسم المنتج والكود", variant: "destructive" });
      return;
    }
    setIsAddingProduct(true);
    try {
      const res = await fetch(api.products.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newProductName.trim(), sku: newProductSku.trim(), finish: "none" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل إضافة المنتج");
      }
      toast({ title: "تمت إضافة المنتج بنجاح" });
      setNewProductName("");
      setNewProductSku("");
      setShowAddProduct(false);
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsAddingProduct(false);
    }
  };

  const openQuantityPrompt = (product: any, unit: UnitType) => {
    setQuantityPrompt({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      unit,
    });
    setPromptQuantity("");
  };

  const confirmAddToCart = () => {
    if (!quantityPrompt) return;
    const qty = parseInt(promptQuantity) || 1;
    if (qty < 1) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === quantityPrompt.productId && item.unit === quantityPrompt.unit);
      if (existing) {
        return prev.map(item => 
          (item.productId === quantityPrompt.productId && item.unit === quantityPrompt.unit)
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      return [...prev, { 
        productId: quantityPrompt.productId, 
        productName: quantityPrompt.productName,
        productSku: quantityPrompt.productSku,
        quantity: qty,
        unit: quantityPrompt.unit,
      }];
    });

    toast({ title: `تمت الإضافة: ${promptQuantity} ${quantityPrompt.unit === "bag" ? "شكارة" : "قطعة"}` });
    setQuantityPrompt(null);
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
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 min-h-screen flex flex-col overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-6">
          <div className="flex flex-col gap-4 pl-0 lg:pl-80">
            <div className="flex flex-row flex-wrap justify-between items-center gap-2">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">طلب جديد</h1>
                <p className="text-slate-500">اختر المنتجات وأضفها للسلة</p>
              </div>
              <Button 
                className="gap-1 shrink-0"
                onClick={() => setShowAddProduct(true)}
                data-testid="button-open-add-product"
              >
                <Plus className="h-4 w-4" />
                إضافة منتج
              </Button>
            </div>
            
            <div className="relative z-10">
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
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-0 pl-0 lg:pl-80">
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
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2" dir="ltr" style={{ textAlign: "left" }}>{product.name}</h3>
                        <p className="text-xs text-slate-400">{product.sku}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="min-w-[70px] gap-1 text-xs"
                          onClick={() => openQuantityPrompt(product, "piece")}
                          data-testid={`button-add-piece-${product.id}`}
                        >
                          <Package className="h-3 w-3 shrink-0" />
                          <span>قطعة</span>
                        </Button>
                        {!product.name.includes("Tige Filetée") && (
                          <Button 
                            size="sm" 
                            className="min-w-[70px] gap-1 text-xs"
                            onClick={() => openQuantityPrompt(product, "bag")}
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
                          value={item.quantity || ''}
                          onChange={(e) => updateQuantity(item.productId, item.unit, parseInt(e.target.value) || 0)}
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

        {showAddProduct && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowAddProduct(false)}>
            <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-slate-900 text-center">إضافة منتج جديد</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">اسم المنتج</label>
                    <Input
                      ref={newProductNameRef}
                      placeholder="مثال: Vis TH M6x20"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      data-testid="input-new-product-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">كود المنتج (SKU)</label>
                    <Input
                      placeholder="مثال: VIS-TH-M6x20-BRUT"
                      value={newProductSku}
                      onChange={(e) => setNewProductSku(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddProduct(); }}
                      data-testid="input-new-product-sku"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleAddProduct}
                    disabled={isAddingProduct}
                    data-testid="button-confirm-add-product"
                  >
                    {isAddingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    إضافة
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddProduct(false)}
                    data-testid="button-cancel-add-product"
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {quantityPrompt && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setQuantityPrompt(null)}>
            <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-lg text-slate-900">{quantityPrompt.productName}</h3>
                  <p className="text-xs text-slate-400">{quantityPrompt.productSku}</p>
                  <Badge variant={quantityPrompt.unit === "bag" ? "default" : "outline"} className="mt-2">
                    {quantityPrompt.unit === "bag" ? "شكارة 25 كغ" : "قطعة"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">الكمية</label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setPromptQuantity(String(Math.max(1, (parseInt(promptQuantity) || 1) - 1)))}
                      data-testid="button-prompt-decrease"
                    >
                      -
                    </Button>
                    <Input
                      ref={quantityInputRef}
                      type="number"
                      min="1"
                      className="text-center text-lg font-bold h-10"
                      value={promptQuantity}
                      onChange={(e) => setPromptQuantity(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") confirmAddToCart(); }}
                      data-testid="input-prompt-quantity"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setPromptQuantity(String((parseInt(promptQuantity) || 0) + 1))}
                      data-testid="button-prompt-increase"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 gap-2"
                    onClick={confirmAddToCart}
                    data-testid="button-confirm-add"
                  >
                    <Check className="h-4 w-4" />
                    إضافة للسلة
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setQuantityPrompt(null)}
                    data-testid="button-cancel-add"
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
