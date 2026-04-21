"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Settings,
  Megaphone,
  Package,
  ShoppingCart,
  Calendar,
  MessageSquare
} from "lucide-react";
import { useAuth } from "./auth-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
    { name: "Tổng quan", href: "/", icon: LayoutDashboard },
    { name: "Chat Đa Kênh", href: "/chat", icon: MessageSquare },
    { name: "Marketing", href: "/channels", icon: Megaphone },
    { name: "Khách Tiềm Năng", href: "/leads", icon: Users },
    { name: "Khách Hàng", href: "/customers", icon: UserCheck },
    { name: "Chăm Sóc & Nhắc Việc", href: "/tasks", icon: Calendar },
    { name: "Kho Sản Phẩm", href: "/products", icon: Package },
    { name: "Báo Giá", href: "/quotations", icon: FileText },
    { name: "Đơn Hàng", href: "/orders", icon: ShoppingCart },
  ];

  if (user?.role === "admin") {
    links.push({ name: "Cài Đặt", href: "/settings", icon: Settings });
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
        <span className="text-xl font-bold text-white tracking-tight">Tân Gia Huy</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors font-medium text-sm",
                isActive 
                  ? "bg-slate-800 text-white" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="flex flex-col gap-3 p-3 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="font-medium text-white text-sm">{user?.name || "User"}</p>
              <p className="text-xs text-slate-400">{user?.role === "admin" ? "Administrator" : "Staff"}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
