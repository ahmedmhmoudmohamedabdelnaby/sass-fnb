import { createClient } from "@/lib/supabase/server";
import { createCategory, createMenuItem } from "@/app/actions/ops";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        <Link href="/ops/restaurants" className="hover:text-black">Restaurants</Link>
        <span>/</span>
        <Link href={`/ops/restaurants/${restaurant.id}`} className="hover:text-black">{restaurant.name}</Link>
        <span>/</span>
        <span className="font-medium text-gray-900">Menu Setup</span>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-1">Create Category</h2>
          <p className="text-sm text-gray-500">Add a new section (e.g. Starters, Mains)</p>
        </div>
        <form action={createCategory.bind(null, restaurant.id)} className="flex items-end gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input type="text" name="name" className="border rounded px-2 py-1.5 text-sm w-48" required />
          </div>
          <button type="submit" className="bg-black text-white px-4 py-1.5 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors">
            Add
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {categories?.map((cat) => (
          <div key={cat.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-medium text-lg text-gray-900">{cat.name}</h3>
              <div className="text-xs text-gray-500">Order: {cat.order_idx}</div>
            </div>
            
            <div className="p-4 bg-gray-50 border-b">
              <form action={async (formData) => {
                "use server";
                await createMenuItem(cat.id, restaurant.id, formData);
              }} className="flex items-end gap-3 flex-wrap">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Item Name</label>
                  <input type="text" name="name" className="border rounded px-2 py-1.5 text-sm w-40" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                  <input type="number" step="0.01" name="price" className="border rounded px-2 py-1.5 text-sm w-24" required />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description (optional)</label>
                  <input type="text" name="description" className="border rounded px-2 py-1.5 text-sm w-full" />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors">
                  Add Item
                </button>
              </form>
            </div>

            {cat.menu_items?.length > 0 ? (
              <table className="w-full text-left text-sm">
                <tbody>
                  {cat.menu_items
                    .sort((a: any, b: any) => a.order_idx - b.order_idx)
                    .map((item: any) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-medium">{item.name}</td>
                      <td className="p-4 text-gray-500 max-w-sm truncate">{item.description}</td>
                      <td className="p-4 text-right font-medium">${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm">
                No items in this category.
              </div>
            )}
          </div>
        ))}
        {categories?.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-100 shadow-sm">
            Create a category above to start building the menu.
          </div>
        )}
      </div>
    </div>
  );
}
