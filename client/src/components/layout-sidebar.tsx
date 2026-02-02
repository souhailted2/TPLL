import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "./ui/button";
import { NotificationDropdown } from "./notification-dropdown";

interface SidebarProps {
  role: 'admin' | 'sales_point';
}

export function Sidebar({ role }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const adminLinks = [
    { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/admin/products", label: "المنتجات", icon: Package },
    { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
  ];

  const salesLinks = [
    { href: "/sales/new-order", label: "طلب جديد", icon: ShoppingCart },
    { href: "/sales/orders", label: "طلباتي", icon: ClipboardList },
  ];

  const links = role === 'admin' ? adminLinks : salesLinks;

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-2 right-2 z-50 flex items-center gap-2">
        <NotificationDropdown />
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-slate-900/80 backdrop-blur-md text-white border-slate-700/50 hover:bg-slate-800 shadow-xl" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="h-full flex flex-col pt-16 md:pt-0">
          {/* Header */}
          <div className="p-6 border-b border-slate-700 hidden md:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/images/logo.png" alt="TPL Logo" className="h-10 w-10 object-contain rounded-lg" />
                <div>
                  <h1 className="font-bold font-display text-lg">شركة TPL</h1>
                  <p className="text-xs text-slate-400">نظام إدارة الطلبات</p>
                </div>
              </div>
              <NotificationDropdown />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto" onClick={() => setIsOpen(false)}>
            <div className="md:hidden flex items-center gap-3 mb-6 px-2 pb-6 border-b border-slate-700">
              <img src="/images/logo.png" alt="TPL Logo" className="h-10 w-10 object-contain rounded-lg" />
              <div>
                <h1 className="font-bold font-display text-lg">شركة TPL</h1>
                <p className="text-xs text-slate-400">نظام إدارة الطلبات</p>
              </div>
            </div>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              
              return (
                <Link key={link.href} href={link.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}>
                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                    <span className="font-medium">{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer / User Info */}
          <div className="p-4 border-t border-slate-700 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                {role === 'admin' ? 'AD' : 'SP'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{role === 'admin' ? 'المدير' : 'نقطة بيع'}</p>
              </div>
            </div>
            
            <button 
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-slate-700 hover:border-red-500/50"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
