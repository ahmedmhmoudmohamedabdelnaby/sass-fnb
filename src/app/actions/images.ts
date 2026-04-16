"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Ensure ops_admin role
async function verifyOpsAdmin() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.user_metadata?.role !== "ops_admin") {
    throw new Error("Unauthorized");
  }
  return supabase;
}

export async function uploadRestaurantImage(restaurantId: string, formData: FormData) {
  const supabase = await verifyOpsAdmin();
  const file = formData.get("file") as File;
  const isCover = formData.get("isCover") === "true";

  if (!file) return { error: "No file uploaded" };

  const fileExt = file.name.split(".").pop();
  const fileName = isCover ? `cover.${fileExt}` : `gallery/${Date.now()}.${fileExt}`;
  const filePath = `${restaurantId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("restaurants")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/ops/restaurants/${restaurantId}`);
  return { data };
}

export async function deleteRestaurantImage(restaurantId: string, path: string) {
  const supabase = await verifyOpsAdmin();

  const { error } = await supabase.storage
    .from("restaurants")
    .remove([path]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/ops/restaurants/${restaurantId}`);
  return { success: true };
}

export async function uploadMenuItemImage(restaurantId: string, itemId: string, formData: FormData) {
  const supabase = await verifyOpsAdmin();
  const file = formData.get("file") as File;

  if (!file) return { error: "No file uploaded" };

  const fileExt = file.name.split(".").pop();
  const filePath = `${restaurantId}/items/${itemId}-${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("restaurants")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) return { error: uploadError.message };

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from("restaurants")
    .getPublicUrl(filePath);

  // Update DB column
  const { error: dbError } = await supabase
    .from("menu_items")
    .update({ image_url: urlData.publicUrl })
    .eq("id", itemId);

  if (dbError) return { error: dbError.message };

  revalidatePath(`/ops/restaurants/${restaurantId}/menu`);
  // also public path rendering
  const { data: rest } = await supabase.from("restaurants").select("slug").eq("id", restaurantId).single();
  if (rest) revalidatePath(`/${rest.slug}`);

  return { success: true, url: urlData.publicUrl };
}
