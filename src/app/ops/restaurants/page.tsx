import { createClient } from "@/lib/supabase/server";
import { createRestaurant, softDeleteRestaurant } from "@/app/actions/ops";
import Link from "next/link";
import React from "react";
import { Plus, ExternalLink, Settings2, Trash2, Building2 } from "lucide-react";

export default async function OpsRestaurantsPage() {
  const supabase = createClient();
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching restaurants", error);
  }

  const isEmpty = !restaurants || restaurants.length === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-2xl shadow-sm border border-[#EAEAEA]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Organizations</h1>
          <p className="text-gray-500 text-sm mt-1">Manage single-tenant restaurant platforms across the ecosystem.</p>
        </div>
        
        <form action={createRestaurant} className="flex gap-3 items-end w-full md:w-auto p-4 md:p-0 bg-gray-50 md:bg-transparent rounded-xl border md:border-transparent border-gray-100">
          <div className="flex-1 md:flex-none">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
            <input 
              name="name" 
              placeholder="e.g. Pasta Palace" 
              className="w-full md:w-48 bg-white border border-gray-200/80 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder:text-gray-300"
              required 
            />
          </div>
          <div className="flex-1 md:flex-none">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">URL Slug</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">/</span>
              <input 
                name="slug" 
                placeholder="slug" 
                className="w-full md:w-36 bg-white border border-gray-200/80 pl-6 pr-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder:text-gray-300"
                required 
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-gray-800 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Create</span>
          </button>
        </form>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EAEAEA] overflow-hidden">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <Building2 className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No restaurants unified</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Use the creation form above to instantiate a new single-tenant environment.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAEAEA] bg-gray-50/50">
                <th className="px-6 py-4 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Restaurant</th>
                <th className="px-6 py-4 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Domain Link</th>
                <th className="px-6 py-4 font-semibold text-[11px] text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-[11px] text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {restaurants.map((rest) => (
                <tr key={rest.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{rest.name}</div>
                    <div className="text-[11px] font-mono text-gray-400 mt-1">ID: {rest.id.substring(0,8)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/${rest.slug}`} className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-black transition-colors" target="_blank">
                      /{rest.slug}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {rest.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/ops/restaurants/${rest.id}`}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        title="Settings"
                      >
                        <Settings2 size={16} />
                      </Link>
                      <form action={async () => {
                        "use server";
                        await softDeleteRestaurant(rest.id);
                      }} className="inline">
                        <button type="submit" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
