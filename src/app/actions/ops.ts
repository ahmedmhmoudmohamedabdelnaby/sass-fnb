"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function verifyOpsAdmin() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user || user.user_metadata?.role !== "ops_admin") {
    redirect("/login");
  }
  return supabase;
}

export async function createRestaurant(formData: FormData) {
  const supabase = await verifyOpsAdmin();
  const slug = formData.get("slug") as string;
  const name = formData.get("name") as string;

  if (!slug || !name) throw new Error("Slug and Name are required");

  const { data, error } = await supabase.rpc("create_restaurant_flow_v2", {
    p_slug: slug,
    p_name: name,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/ops/restaurants");
  return data;
}

export async function updateRestaurant(restaurantId: string, formData: FormData) {
  const supabase = await verifyOpsAdmin();
  const name = formData.get("name") as string;
  const isActive = formData.get("is_active") === "true";

  if (!name) throw new Error("Name is required");

  const { error } = await supabase
    .from("restaurants")
    .update({ name, is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", restaurantId);

  if (error) throw new Error(error.message);

  revalidatePath(`/ops/restaurants/${restaurantId}`);
  revalidatePath("/ops/restaurants");
}

export async function softDeleteRestaurant(restaurantId: string) {
  const supabase = await verifyOpsAdmin();
  
  const { error } = await supabase
    .from("restaurants")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", restaurantId);

  if (error) throw new Error(error.message);

  revalidatePath("/ops/restaurants");
}

export async function createCategory(restaurantId: string, formData: FormData) {
  const supabase = await verifyOpsAdmin();
  const name = formData.get("name") as string;
  const order_idx = parseInt((formData.get("order_idx") as string) || "0");

  if (!name) throw new Error("Name is required");

  const { error } = await supabase
    .from("categories")
    .insert({ restaurant_id: restaurantId, name, order_idx });

  if (error) throw new Error(error.message);

  revalidatePath(`/ops/restaurants/${restaurantId}/menu`);
}

export async function createMenuItem(categoryId: string, restaurantId: string, formData: FormData) {
  const supabase = await verifyOpsAdmin();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const image_url = formData.get("image_url") as string;
  const order_idx = parseInt((formData.get("order_idx") as string) || "0");

  if (!name || isNaN(price)) throw new Error("Valid Name and Price are required");

  const { error } = await supabase
    .from("menu_items")
    .insert({
      category_id: categoryId,
      restaurant_id: restaurantId,
      name,
      description,
      price,
      image_url,
      order_idx,
    });

  if (error) throw new Error(error.message);

  revalidatePath(`/ops/restaurants/${restaurantId}/menu`);
}
