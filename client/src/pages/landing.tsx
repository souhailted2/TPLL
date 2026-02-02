import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Wrench, ArrowLeft, ShieldCheck, BarChart3, Globe, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { isLoading } = useAuth();

  const handleLogin = () => {
    window.location.href = "/api/login";
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
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 font-display">مصنع البراغي</span>
        </div>
        <Button onClick={handleLogin} variant="outline" className="hidden sm:flex border-primary text-primary hover:bg-primary hover:text-white">
          تسجيل الدخول
        </Button>
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-6 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              ابدأ الآن
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
            <Button variant="ghost" size="lg" className="text-lg px-8 py-6 text-slate-600">
              تواصل معنا للدعم
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-right">
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

        {/* Visual/Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1 w-full max-w-lg lg:max-w-xl"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
            {/* Manufacturing/Factory Stock Image */}
            {/* modern factory automation machine parts */}
            <img 
              src="https://pixabay.com/get/g5dcd391f6cfff2f498a15f3a7ca397f7d52ff28d5c375590378e7b4bcd3d1cceae569462a34491befa3ba7c20cb499ddc7b90baaae31221aa74f6681f4d9e745_1280.jpg" 
              alt="Industrial Factory" 
              className="relative rounded-3xl shadow-2xl border-4 border-white object-cover aspect-square w-full"
            />
            
            {/* Floating Card 1 */}
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">تم استلام طلب جديد</p>
                <p className="text-sm font-bold text-slate-900">50,000 قطعة</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
