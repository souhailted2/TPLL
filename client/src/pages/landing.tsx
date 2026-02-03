import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldCheck, BarChart3, Globe, LogIn, User, Lock, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ACCOUNTS = [
  { id: "owner", label: "المالك (Owner)", role: "admin" },
  { id: "factory", label: "المصنع (Factory)", role: "admin" },
  { id: "alger", label: "نقطة الجزائر (Alger)", role: "sales" },
  { id: "eloued", label: "نقطة الوادي (El Oued)", role: "sales" },
  { id: "elma", label: "نقطة العلمة (Elma)", role: "sales" },
];

export default function LandingPage() {
  const { isLoading, login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار حساب وإدخال كلمة المرور",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({ username, password });
      toast({
        title: "تم تسجيل الدخول",
        description: "مرحباً بك في النظام",
      });
    } catch (error: any) {
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message || "كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* Navigation */}
      <header className="px-6 lg:px-12 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="TPL Logo" className="h-12 w-12 object-contain" />
          <span className="font-bold text-xl text-slate-900 font-display">شركة صناعة البراغي واللوالب والمسامير (TPL)</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col lg:flex-row-reverse items-center justify-center px-6 lg:px-12 gap-12 lg:gap-24 max-w-7xl mx-auto w-full py-12">
        
        {/* Login Form - First on mobile */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex-1 w-full max-w-md"
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
              <p className="text-muted-foreground text-sm mt-2">اختر حسابك وأدخل كلمة المرور</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    اختر الحساب
                  </Label>
                  <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto p-1">
                    {ACCOUNTS.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setUsername(acc.id)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-right",
                          username === acc.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          username === acc.id ? "text-primary" : "text-slate-700"
                        )}>
                          {acc.label}
                        </span>
                        {username === acc.id && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-base">
                    <Lock className="h-4 w-4" />
                    كلمة المرور
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-right h-12 text-lg"
                    data-testid="input-password"
                    disabled={isLoggingIn}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-2 h-12 text-lg shadow-lg shadow-primary/20" 
                  disabled={isLoggingIn || !username}
                  data-testid="button-login"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الدخول...
                    </>
                  ) : (
                    <>
                      <LogIn className="ml-2 h-5 w-5" />
                      دخول للنظام
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Text Content - Second on mobile */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 max-w-xl text-center lg:text-right"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            نظام إدارة سلسلة التوريد الذكي
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold font-display text-slate-900 leading-tight mb-6">
            ربط نقاط البيع <br/>
            <span className="text-primary">بخط الإنتاج مباشرة</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            منصة متكاملة لإدارة الطلبات والمخزون، مصممة خصيصاً لربط نقاط البيع بالمصنع لضمان سرعة التوريد ودقة الإنتاج.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 text-right">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2" />
              <h3 className="font-bold text-slate-900">أمان عالي</h3>
              <p className="text-sm text-slate-500">حماية بيانات العملاء والطلبات</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <BarChart3 className="h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-bold text-slate-900">تحليلات دقيقة</h3>
              <p className="text-sm text-slate-500">تتبع المبيعات والإنتاج لحظياً</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <Globe className="h-8 w-8 text-purple-500 mb-2" />
              <h3 className="font-bold text-slate-900">ربط فوري</h3>
              <p className="text-sm text-slate-500">تحديث مباشر بين المعرض والمصنع</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
