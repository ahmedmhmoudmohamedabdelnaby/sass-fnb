import { createClient } from "@/lib/supabase/server";
import { updateRestaurant } from "@/app/actions/ops";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

export default async function OpsRestaurantDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !restaurant) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        <Link href="/ops/restaurants" className="hover:text-black">Restaurants</Link>
        <span>/</span>
        <span className="font-medium text-gray-900">{restaurant.name}</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 cursor-pointer">System Configuration</h2>
            <form action={updateRestaurant.bind(null, restaurant.id)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={restaurant.name} 
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Status</label>
                <select 
                  name="is_active" 
                  defaultValue={restaurant.is_active ? "true" : "false"}
                  className="w-full border rounded-md p-2"
                >
                  <option value="true">Active (Publicly Visible)</option>
                  <option value="false">Inactive (Suspended)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Setting this to inactive will block all public requests to /{restaurant.slug}.</p>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-black text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4">
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            
            <Link 
              href={`/ops/restaurants/${restaurant.id}/menu`}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
            >
              <span className="font-medium text-gray-800">Edit Menu Data</span>
              <span className="text-gray-400">→</span>
            </Link>

            <Link 
              href={`/${restaurant.slug}`}
              target="_blank"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
            >
              <span className="font-medium text-gray-800">View Public Link</span>
              <span className="text-gray-400">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
