import { Sidebar } from "@/components/layout-sidebar";
import { useProducts } from "@/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function ReceptionProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 50;
  const { data: productsData, isLoading } = useProducts({ search: debouncedSearch, limit, offset: page * limit });
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", finish: "none", size: "" });

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const products = productsData?.products || [];
  const total = productsData?.total || 0;

  const getFinishLabel = (finish: string) => {
    switch(finish) {
      case 'cold': return 'Zingué';
      case 'hot': return 'Zingué à chaud';
      case 'acier': return 'Acier';
      default: return 'Brut';
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sku) {
      toast({ title: "خطأ", description: "الاسم والكود مطلوبان", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) throw new Error("فشل إضافة المنتج");
      toast({ title: "تمت الإضافة", description: "تم إضافة المنتج بنجاح" });
      setAddOpen(false);
      setNewProduct({ name: "", sku: "", finish: "none", size: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleExport = useCallback(async () => {
    try {
      const res = await fetch('/api/products/export', { credentials: 'include' });
      if (!res.ok) throw new Error("فشل التصدير");
      const data = await res.json();
      const headers = ["الاسم", "الكود", "المقاس", "التشطيب"];
      const rows = data.map((p: any) => [p.name, p.sku, p.size || "", getFinishLabel(p.finish)]);
      const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "تم التصدير", description: `تم تصدير ${data.length} منتج` });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="reception" />
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900" data-testid="text-page-title">المنتجات</h1>
              <p className="text-slate-500">كتالوج المنتجات ({total} منتج)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={handleExport} data-testid="button-export">
                <Download className="h-4 w-4 ml-1" />
                <span className="hidden sm:inline">تصدير</span>
              </Button>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-product">
                    <Plus className="h-4 w-4 ml-1" />
                    <span className="hidden sm:inline">إضافة منتج</span>
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إضافة منتج جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>اسم المنتج</Label>
                      <Input value={newProduct.name} onChange={e => setNewProduct(p => ({...p, name: e.target.value}))} data-testid="input-product-name" />
                    </div>
                    <div>
                      <Label>كود المنتج (SKU)</Label>
                      <Input value={newProduct.sku} onChange={e => setNewProduct(p => ({...p, sku: e.target.value}))} data-testid="input-product-sku" />
                    </div>
                    <div>
                      <Label>المقاس</Label>
                      <Input value={newProduct.size} onChange={e => setNewProduct(p => ({...p, size: e.target.value}))} data-testid="input-product-size" />
                    </div>
                    <div>
                      <Label>التشطيب</Label>
                      <Select value={newProduct.finish} onValueChange={v => setNewProduct(p => ({...p, finish: v}))}>
                        <SelectTrigger data-testid="select-product-finish"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Brut</SelectItem>
                          <SelectItem value="cold">Zingué</SelectItem>
                          <SelectItem value="hot">Zingué à chaud</SelectItem>
                          <SelectItem value="acier">Acier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={handleAddProduct} data-testid="button-save-product">حفظ</Button>
                  </div>
                </DialogContent>
              </Dialog>
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

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
            {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الكود</TableHead>
                    <TableHead>المقاس</TableHead>
                    <TableHead>التشطيب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any) => (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell>{product.size}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getFinishLabel(product.finish)}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {total > limit && (
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)} data-testid="button-prev-page">السابق</Button>
              <span className="text-sm text-slate-500 flex items-center">صفحة {page + 1} من {Math.ceil(total / limit)}</span>
              <Button size="sm" variant="outline" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)} data-testid="button-next-page">التالي</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
