import { createClient } from "@/lib/supabase/server";
import { createCategory, createMenuItem } from "@/app/actions/ops";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { ChevronRight, Plus, Tags, GripVertical } from "lucide-react";
import { ItemImageUploader } from "./item-image-uploader";

export default async function OpsMenuEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: restaurant, error: rError } = await supabase
    .from("restaurants")
    .select("id, name, slug")
    .eq("id", params.id)
    .single();

  if (rError || !restaurant) {
    return notFound();
  }

  const { data: categories, error: cError } = await supabase
    .from("categories")
    .select("*, menu_items(*)")
    .eq("restaurant_id", params.id)
    .order("order_idx", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/ops/restaurants" className="hover:text-black transition-colors">Organizations</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <Link href={`/ops/restaurants/${restaurant.id}`} className="hover:text-black transition-colors">{restaurant.name}</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="font-semibold text-gray-900">Menu Data</span>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#EAEAEA] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-xl font-bold mb-1 text-gray-900 tracking-tight">Menu Architecture</h2>
          <p className="text-sm text-gray-500">Construct the semantic layout of the public restaurant menu.</p>
        </div>
        <form action={createCategory.bind(null, restaurant.id)} className="flex items-end gap-2 w-full md:w-auto bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl border border-gray-100 md:border-transparent">
          <div className="flex-1 md:flex-none">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Category Title</label>
            <input type="text" name="name" placeholder="E.g. Main Courses" className="w-full md:w-56 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder:text-gray-300" required />
          </div>
          <button type="submit" className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-gray-800 transition-all active:scale-95">
            <Plus size={16} /> Add Category
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {categories?.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-[#EAEAEA] overflow-hidden">
            <div className="bg-gray-50/50 p-5 flex justify-between items-center border-b border-[#EAEAEA]">
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-gray-300 cursor-move" />
                <h3 className="font-semibold text-lg text-gray-900">{cat.name}</h3>
              </div>
              <div className="text-[11px] font-mono text-gray-400 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                idx: {cat.order_idx}
              </div>
            </div>
            
            <div className="p-5 border-b border-[#EAEAEA] bg-white">
              <form action={async (formData) => {
                "use server";
                await createMenuItem(cat.id, restaurant.id, formData);
              }} className="flex flex-col md:flex-row items-end gap-3">
                <div className="w-full md:w-auto">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Item Name</label>
                  <input type="text" name="name" placeholder="Wagyu Burger" className="w-full md:w-48 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all" required />
                </div>
                <div className="w-full md:w-auto">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Price ($)</label>
                  <input type="number" step="0.01" name="price" placeholder="19.99" className="w-full md:w-28 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all" required />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                  <input type="text" name="description" placeholder="A brief description of this item..." className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all" />
                </div>
                <button type="submit" className="w-full md:w-auto bg-gray-900 text-white px-5 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-black transition-colors whitespace-nowrap">
                  Add Item
                </button>
              </form>
            </div>

            {cat.menu_items?.length > 0 ? (
              <table className="w-full text-left">
                <tbody className="divide-y divide-[#EAEAEA]">
                  {cat.menu_items
                    .sort((a: any, b: any) => a.order_idx - b.order_idx)
                    .map((item: any) => (
                    <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 w-2/5 font-semibold text-gray-900">
                        <div className="flex items-center gap-4">
                          <ItemImageUploader restaurantId={restaurant.id} itemId={item.id} currentUrl={item.image_url} />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="p-5 text-gray-500 text-sm max-w-sm truncate w-2/5">{item.description || <span className="italic text-gray-300">No description</span>}</td>
                      <td className="p-5 text-right font-semibold text-gray-900 w-1/5">${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-gray-50 p-3 rounded-full mb-3">
                  <Tags size={24} className="text-gray-300" />
                </div>
                <span className="text-sm font-medium text-gray-900">Category is empty</span>
                <span className="text-sm text-gray-500 mt-1">Add items globally using the form above.</span>
              </div>
            )}
          </div>
        ))}
        {categories?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-transparent border-2 border-dashed border-gray-200 rounded-2xl">
             <div className="bg-white p-4 shadow-sm border border-gray-100 rounded-full mb-4">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Begin Architecture</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Menus start with Categories. Define your first one above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
