"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, ListTree, Package, ShoppingCart, Users, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import StatusIndicator from "./components/StatusIndicator";

export default function AdminLayout({ children }: { children: ReactNode }) {    
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navItems = [
    { href: "/admin", label: "Asosiy", icon: LayoutDashboard },
    { href: "/admin/categories", label: "Kategoriyalar", icon: ListTree },      
    { href: "/admin/products", label: "Mahsulotlar", icon: Package },
    { href: "/admin/orders", label: "Buyurtmalar", icon: ShoppingCart },        
    { href: "/admin/staff", label: "Xodimlar", icon: Users },
    { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
  ];

  return (
    <div className="flex h-[100dvh] bg-gray-50 overflow-hidden">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-30 shadow-sm transition-all">        
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>        
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 focus:outline-none bg-gray-50 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar as Drawer on Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white border-r w-[280px] z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:static md:translate-x-0 flex flex-col ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        <div className="p-6 flex justify-between items-center h-16 md:h-20 border-b md:border-b-0 md:flex">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>     
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-2 md:mt-4 flex flex-col px-3 gap-1 overflow-y-auto pb-6 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-[15px] ${isActive ? "bg-green-500 text-white shadow-md shadow-green-200/50 translate-x-1" : "text-gray-600 hover:bg-green-50 hover:text-green-600 hover:translate-x-1"}`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-gray-500"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="px-3 pb-4 mt-auto">
          <StatusIndicator />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-[100dvh] overflow-y-auto pt-16 md:pt-0 relative w-full bg-gray-50 scroll-smooth">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">      
          {children}
        </div>
      </main>
    </div>
  );
}
