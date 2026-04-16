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

  if (!file) throw new Error("No file uploaded");

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
    throw new Error(error.message);
  }

  revalidatePath(`/ops/restaurants/${restaurantId}`);
  return data;
}

export async function deleteRestaurantImage(restaurantId: string, path: string) {
  const supabase = await verifyOpsAdmin();

  const { error } = await supabase.storage
    .from("restaurants")
    .remove([path]);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/ops/restaurants/${restaurantId}`);
  return true;
}
