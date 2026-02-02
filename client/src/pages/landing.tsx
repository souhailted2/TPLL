import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldCheck, BarChart3, Globe, Package, LogIn, User, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
        description: "يرجى إدخال اسم المستخدم وكلمة المرور",
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
        description: error.message || "اسم المستخدم أو كلمة المرور غير صحيحة",
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
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 lg:px-12 gap-12 lg:gap-24 max-w-7xl mx-auto w-full py-12">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
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

        {/* Login Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1 w-full max-w-md"
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
              <p className="text-muted-foreground text-sm mt-2">أدخل بيانات حسابك للدخول إلى النظام</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    اسم المستخدم
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-right"
                    data-testid="input-username"
                    disabled={isLoggingIn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    كلمة المرور
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-right"
                    data-testid="input-password"
                    disabled={isLoggingIn}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  size="lg"
                  disabled={isLoggingIn}
                  data-testid="button-login"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <LogIn className="ml-2 h-5 w-5" />
                      دخول
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground mb-3">حسابات النظام:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded">
                    <p className="font-bold">المالك/المصنع</p>
                    <p className="text-muted-foreground">owner / factory</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <p className="font-bold">نقاط البيع</p>
                    <p className="text-muted-foreground">alger / eloued / elma</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
