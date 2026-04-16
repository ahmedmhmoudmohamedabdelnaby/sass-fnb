import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { themes, ThemePreset } from "@/lib/themes";

export default async function RestaurantMenuPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc("get_restaurant_data", { lookup_slug: params.slug });

  if (error || !data) {
    return notFound();
  }

  // Check if there's a cover image in the public storage bucket
  const { data: publicUrlData } = supabase.storage
    .from("restaurants")
    .getPublicUrl(`${data.id}/cover.jpg`); // Ext may vary, but let's assume getPublicUrl works if we pass the right path. Wait, actually we don't know the extension. Let's just list the files first to find the exact cover name.

  let coverUrl = null;
  const { data: files } = await supabase.storage.from("restaurants").list(data.id);
  if (files) {
    const coverFile = files.find(f => f.name.startsWith("cover."));
    if (coverFile) {
      coverUrl = supabase.storage.from("restaurants").getPublicUrl(`${data.id}/${coverFile.name}`).data.publicUrl;
    }
  }

  const themeName = (data.theme_preset as ThemePreset) || "default";
  const ThemeComponent = themes[themeName] || themes.default;

  return <ThemeComponent data={{ ...data, coverUrl }} />;
}
