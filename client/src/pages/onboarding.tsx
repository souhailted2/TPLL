import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateUserRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Store, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  salesPointName: z.string().min(3, "اسم نقطة البيع يجب أن يكون 3 أحرف على الأقل"),
  role: z.enum(["sales_point", "admin"]), // In a real app, role selection would be restricted
});

export default function Onboarding() {
  const { mutateAsync: updateRole, isPending } = useUpdateUserRole();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesPointName: "",
      role: "sales_point",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateRole(values);
      toast({
        title: "تم الحفظ بنجاح",
        description: "جاري توجيهك إلى لوحة التحكم...",
      });
      // Force reload to pick up new role state
      window.location.reload();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">إكمال الملف الشخصي</CardTitle>
          <CardDescription>
            يرجى إدخال بيانات نقطة البيع للمتابعة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الحساب</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الحساب" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sales_point">نقطة بيع (فرع)</SelectItem>
                        {/* For demo purposes, letting user choose admin. In prod, this is hidden */}
                        <SelectItem value="admin">مدير المصنع (Admin)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salesPointName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الفرع / المعرض</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Store className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pr-9" placeholder="مثال: فرع الرياض - العليا" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ ومتابعة"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
