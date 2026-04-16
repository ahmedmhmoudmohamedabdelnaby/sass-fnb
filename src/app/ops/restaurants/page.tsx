import { createClient } from "@/lib/supabase/server";
import { createRestaurant, softDeleteRestaurant } from "@/app/actions/ops";
import Link from "next/link";
import React from "react";

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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Restaurants</h1>
          <p className="text-gray-500 text-sm mt-1">Manage global system instances.</p>
        </div>
        
        <form action={createRestaurant} className="flex gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input 
              name="name" 
              placeholder="e.g. Pasta Palace" 
              className="border p-2 rounded-md text-sm w-48"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
            <input 
              name="slug" 
              placeholder="e.g. pasta-palace" 
              className="border p-2 rounded-md text-sm w-48"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="bg-black text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            Create Setup
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-sm text-gray-600">Restaurant</th>
              <th className="p-4 font-medium text-sm text-gray-600">Slug URL</th>
              <th className="p-4 font-medium text-sm text-gray-600">Status</th>
              <th className="p-4 font-medium text-sm text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(restaurants || []).map((rest) => (
              <tr key={rest.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{rest.name}</div>
                  <div className="text-xs text-gray-400 mt-1">ID: {rest.id.substring(0,8)}...</div>
                </td>
                <td className="p-4">
                  <Link href={`/${rest.slug}`} className="text-blue-600 hover:underline text-sm" target="_blank">
                    /{rest.slug}
                  </Link>
                </td>
                <td className="p-4">
                  {rest.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="p-4 text-right space-x-3">
                  <Link 
                    href={`/ops/restaurants/${rest.id}`}
                    className="text-sm text-gray-600 hover:text-black font-medium"
                  >
                    View details
                  </Link>
                  <form action={async () => {
                    "use server";
                    await softDeleteRestaurant(rest.id);
                  }} className="inline">
                    <button type="submit" className="text-sm text-red-600 hover:text-red-800 font-medium ml-2">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {restaurants?.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No restaurants registered in the system yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
