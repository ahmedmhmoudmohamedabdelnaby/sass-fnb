import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import React from "react";

export default async function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  // Safe to assume user is present because middleware handles protection
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-6">
          <Link href="/ops/restaurants" className="font-bold text-xl text-gray-800">
            Ops Dashboard
          </Link>
        </div>
        <nav className="px-4 space-y-2 mt-4">
          <Link 
            href="/ops/restaurants"
            className="block px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md font-medium"
          >
            Restaurants
          </Link>
          <div className="pt-8 block px-4 py-2 text-xs text-gray-400">
            {user?.email} (Admin)
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full p-8">
        {children}
      </main>
    </div>
  );
}
