import { Sidebar } from "@/components/layout-sidebar";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Pencil, Trash2, Search, Package, FileSpreadsheet, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import * as XLSX from "xlsx";

type ProductFormValues = z.infer<typeof insertProductSchema>;

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: productsData, isLoading } = useProducts({ search: debouncedSearch, limit: 100 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormValues & { id: number } | null>(null);
  
  const products = productsData?.products || [];
  
  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useMutation({
    mutationFn: async (products: any[]) => {
      const res = await apiRequest("POST", "/api/import/products", products);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "تم الاستيراد بنجاح", description: `تم إضافة ${data.count} منتج` });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل استيراد الملف", variant: "destructive" });
    }
  });

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const products = jsonData.map((row: any) => ({
        name: row["name"] || row["اسم المنتج"] || row["الاسم"] || "",
        sku: row["sku"] || row["SKU"] || row["رمز المنتج"] || "",
        finish: row["finish"] || row["النوع"] || "none",
        size: row["size"] || row["المقاس"] || "",
        description: row["description"] || row["الوصف"] || "",
      }));

      importMutation.mutate(products);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      finish: "none",
      size: "",
      description: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, ...data });
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "تمت الإضافة بنجاح" });
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingProduct(null);
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء العملية", variant: "destructive" });
    }
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      sku: product.sku,
      finish: product.finish || "none",
      size: product.size || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      sku: "",
      finish: "none",
      size: "",
      description: "",
      imageUrl: "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      await deleteMutation.mutateAsync(id);
      toast({ title: "تم الحذف" });
    }
  };

  const getFinishLabel = (finish: string) => {
    switch(finish) {
      case 'hot': return 'غلفنة على الساخن';
      case 'cold': return 'غلفنة على البارد';
      default: return 'بدون (Brut)';
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExcelExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/products/export", { credentials: "include" });
      if (!res.ok) throw new Error("فشل تحميل المنتجات");
      const allProducts = await res.json();

      const exportData = allProducts.map((product: any) => ({
        "رمز المنتج (SKU)": product.sku,
        "اسم المنتج": product.name,
        "المقاس": product.size || "",
        "النوع": getFinishLabel(product.finish),
        "الوصف": product.description || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "المنتجات");
      
      XLSX.writeFile(workbook, `منتجات_TPL_${new Date().toLocaleDateString('ar-DZ')}.xlsx`);
      toast({ title: "تم التصدير بنجاح", description: `تم تصدير ${allProducts.length} منتج` });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل تصدير المنتجات", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="admin" />
      
      <main className="flex-1 md:mr-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">إدارة المنتجات</h1>
              <p className="text-slate-500">إضافة وتعديل منتجات المصنع</p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleExcelImport}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              
              <Button 
                variant="outline" 
                onClick={handleExcelExport}
                disabled={isExporting}
                data-testid="button-export-excel"
                className="gap-2"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">تصدير</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={importMutation.isPending}
                data-testid="button-import-excel"
                className="gap-2"
              >
                {importMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">استيراد</span>
              </Button>
              
              <Button 
                onClick={openCreate}
                data-testid="button-add-product"
                className="gap-2 shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">إضافة منتج</span>
              </Button>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[500px] z-[100] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المنتج</FormLabel>
                          <FormControl><Input {...field} data-testid="input-product-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رمز المنتج (SKU)</FormLabel>
                            <FormControl><Input {...field} data-testid="input-product-sku" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="finish"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>النوع (Finition)</FormLabel>
                            <FormControl>
                              <select 
                                {...field} 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                data-testid="select-product-finish"
                              >
                                <option value="none">بدون (Brut)</option>
                                <option value="cold">غلفنة على البارد (Zingué à froid)</option>
                                <option value="hot">غلفنة على الساخن (Zingué à chaud)</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المقاس (Size)</FormLabel>
                            <FormControl><Input {...field} value={field.value || ""} placeholder="مثال: 6, M10, 30" data-testid="input-product-size" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوصف</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} data-testid="input-product-description" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-product">
                      {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
          </Dialog>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 min-w-[600px]">
              <Search className="h-5 w-5 text-slate-400" />
              <Input 
                placeholder="بحث بالاسم أو الكود..." 
                className="max-w-md bg-transparent border-none shadow-none focus-visible:ring-0 px-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-products"
              />
            </div>

            {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="min-w-[600px]">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكود</TableHead>
                    <TableHead>المقاس</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id} className="group hover:bg-slate-50" data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-medium flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          <Package className="h-5 w-5" />
                        </div>
                        {product.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell className="font-bold">{product.size || '-'}</TableCell>
                      <TableCell>{getFinishLabel(product.finish)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(product)} data-testid={`button-edit-${product.id}`}>
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} data-testid={`button-delete-${product.id}`}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                        لا توجد منتجات مطابقة
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
