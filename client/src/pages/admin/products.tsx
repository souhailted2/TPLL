import { Sidebar } from "@/components/layout-sidebar";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type ProductFormValues = z.infer<typeof insertProductSchema>;

export default function AdminProducts() {
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormValues & { id: number } | null>(null);
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: "0",
      stockQuantity: 0,
      description: "",
      imageUrl: "",
    },
  });

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      price: product.price.toString(),
      stockQuantity: product.stockQuantity,
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
      price: "0",
      stockQuantity: 0,
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

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <Sidebar role="admin" />
      
      <main className="flex-1 md:mr-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">إدارة المنتجات</h1>
              <p className="text-slate-500">إضافة وتعديل منتجات المصنع والمخزون</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} size="lg" className="shadow-lg shadow-primary/20">
                  <Plus className="ml-2 h-5 w-5" />
                  إضافة منتج جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]" dir="rtl">
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
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رمز المنتج (SKU)</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stockQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الكمية المتوفرة</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>السعر (ر.س)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوصف</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending || updateMutation.isPending}>
                      {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-400" />
              <Input 
                placeholder="بحث عن منتج..." 
                className="max-w-md bg-transparent border-none shadow-none focus-visible:ring-0 px-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>المخزون</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product) => (
                    <TableRow key={product.id} className="group hover:bg-slate-50">
                      <TableCell className="font-medium flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          <Package className="h-5 w-5" />
                        </div>
                        {product.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell>{Number(product.price).toFixed(2)} ر.س</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          product.stockQuantity < 1000 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {product.stockQuantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProducts?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                        لا توجد منتجات مطابقة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
