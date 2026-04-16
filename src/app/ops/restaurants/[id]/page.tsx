import { createClient } from "@/lib/supabase/server";
import { updateRestaurant } from "@/app/actions/ops";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { ImageUploader } from "./image-uploader";
import { ChevronRight, ExternalLink, MenuSquare } from "lucide-react";

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

  // Fetch images from bucket
  let images: { name: string, url: string }[] = [];
  
  try {
    const { data: fileList, error: listError } = await supabase.storage.from("restaurants").list(params.id);
    
    if (fileList && !listError) {
      images = fileList
        .filter(f => f.name !== ".emptyFolderPlaceholder")
        .map(file => {
          const { data } = supabase.storage.from("restaurants").getPublicUrl(`${params.id}/${file.name}`);
          return {
            name: file.name,
            url: data.publicUrl
          };
        });
    }
  } catch (err) {
    console.error("Storage error:", err);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/ops/restaurants" className="hover:text-black transition-colors">Organizations</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="font-semibold text-gray-900">{restaurant.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: System Config & Actions */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EAEAEA]">
            <h2 className="text-base font-semibold mb-6 flex items-center gap-2 text-gray-900">
              System Configuration
            </h2>
            <form action={updateRestaurant.bind(null, restaurant.id)} className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={restaurant.name} 
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Instance Status</label>
                <select 
                  name="is_active" 
                  defaultValue={restaurant.is_active ? "true" : "false"}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                >
                  <option value="true">Active (Live)</option>
                  <option value="false">Suspended</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                  Suspending blocks all public routing to <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono">/{restaurant.slug}</code>.
                </p>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-black text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-gray-800 transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-sm border border-[#EAEAEA] flex flex-col gap-1">
            <Link 
              href={`/ops/restaurants/${restaurant.id}/menu`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover:scale-105 transition-transform"><MenuSquare size={18} /></div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Menu Builder</div>
                  <div className="text-xs text-gray-500">Manage categories & items</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
            </Link>

            <Link 
              href={`/${restaurant.slug}`}
              target="_blank"
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group"
            >
               <div className="flex items-center gap-3">
                <div className="bg-purple-50 text-purple-600 p-2 rounded-lg group-hover:scale-105 transition-transform"><ExternalLink size={18} /></div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Live Preview</div>
                  <div className="text-xs text-gray-500">View public frontend</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Right Column: Imagery */}
        <div className="col-span-1 lg:col-span-2">
          <ImageUploader restaurantId={restaurant.id} images={images} />
        </div>
      </div>
    </div>
  );
}
