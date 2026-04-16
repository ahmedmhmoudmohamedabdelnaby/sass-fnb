import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import React from "react";
import { Store, LogOut, Settings, LayoutDashboard } from "lucide-react";

export default async function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA] text-[#111827]">
      {/* Premium Sidebar */}
      <aside className="w-64 bg-white border-r border-[#EAEAEA] flex flex-col shadow-[1px_0_4px_rgba(0,0,0,0.01)]">
        <div className="p-6 pb-2">
          <Link href="/ops/restaurants" className="flex items-center gap-3">
            <div className="bg-black text-white p-1.5 rounded-lg shadow-sm">
              <Store size={20} />
            </div>
            <span className="font-semibold text-lg hover:text-gray-600 transition-colors">Platform Ops</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1">
          <div className="px-3 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu Management
          </div>
          <Link 
            href="/ops/restaurants"
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-900 bg-gray-100/80 rounded-md font-medium transition-colors border border-gray-200/60 shadow-sm"
          >
            <LayoutDashboard size={18} className="text-gray-700" />
            Restaurants
          </Link>
          <div className="pt-6 px-3 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            System
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md font-medium transition-colors">
            <Settings size={18} />
            Global Settings
          </button>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#EAEAEA] bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 flex items-center justify-center text-white text-xs font-medium shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.email}</span>
              <span className="text-xs text-blue-600 font-medium">Ops Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-gray-100/50 to-transparent pointer-events-none" />
        <div className="p-10 relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
