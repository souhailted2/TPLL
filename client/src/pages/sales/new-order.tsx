import { Sidebar } from "@/components/layout-sidebar";
import { useProducts } from "@/hooks/use-products";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ShoppingCart, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export default function NewOrder() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { mutateAsync: createOrder, isPending: isSubmitting } = useCreateOrder();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.includes(searchTerm)
  );

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        productName: product.name, 
        price: Number(product.price), 
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity: qty } : item
    ));
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    
    try {
      await createOrder({
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });
      
      toast({
        title: "تم إرسال الطلب",
        description: "تم إرسال طلبك إلى المصنع بنجاح",
      });
      setCart([]);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    }
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="sales_point" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 h-screen flex flex-col">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">طلب جديد</h1>
              <p className="text-slate-500">اختر المنتجات وأضفها للسلة</p>
            </div>
            
            <div className="relative w-72">
              <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="بحث عن منتج..." 
                className="pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 overflow-hidden">
            {/* Products Grid */}
            <div className="lg:col-span-3 overflow-y-auto pr-2 pb-20 lg:pb-0">
              {productsLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts?.map((product) => (
                    <Card key={product.id} className="cursor-pointer hover:border-primary transition-colors group">
                      <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                        <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                          <img 
                            src={product.imageUrl || "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=300&q=80"} // screw/bolt mockup
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg mix-blend-multiply"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{product.name}</h3>
                          <p className="text-sm text-slate-500 font-mono">{product.sku}</p>
                          <div className="mt-1 flex justify-center gap-1">
                            <Badge variant="outline" className="text-[10px] h-4">
                              {product.finish === 'hot' ? 'Zingué à chaud' : 
                               product.finish === 'cold' ? 'Zingué à froid' : 'Brut'}
                            </Badge>
                            {product.size && (
                              <Badge variant="secondary" className="text-[10px] h-4 bg-slate-100">
                                {product.size}
                              </Badge>
                            )}
                          </div>
                          <p className="text-primary font-bold mt-1">{Number(product.price).toFixed(2)} ر.س</p>
                        </div>
                        <Button onClick={() => addToCart(product)} className="w-full mt-2" size="sm">
                          <Plus className="h-4 w-4 ml-1" /> إضافة
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden h-[500px] lg:h-full">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span className="font-bold">سلة الطلبات</span>
                </div>
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">{cart.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <ShoppingCart className="h-12 w-12 opacity-20" />
                    <p>السلة فارغة</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-900">{item.productName}</p>
                        <p className="text-xs text-slate-500">{(item.price * item.quantity).toFixed(2)} ر.س</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          className="w-16 h-8 text-center px-1" 
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeFromCart(item.productId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{totalAmount.toFixed(2)} ر.س</span>
                </div>
                <Button 
                  onClick={handleSubmitOrder} 
                  className="w-full py-6 text-lg shadow-lg shadow-primary/20"
                  disabled={cart.length === 0 || isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "إرسال الطلب للمصنع"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
