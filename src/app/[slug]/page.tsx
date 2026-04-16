import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { themes, ThemePreset } from "@/lib/themes";

export default async function RestaurantMenuPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  const decodedSlug = decodeURIComponent(params.slug);
  const { data, error } = await supabase.rpc("get_restaurant_data", { lookup_slug: decodedSlug });

  if (error || !data) {
    return notFound();
  }

  let coverUrl = null;
  
  try {
    const { data: files, error: listError } = await supabase.storage.from("restaurants").list(data.id);
    if (files && !listError) {
      const coverFile = files.find(f => f.name.startsWith("cover."));
      if (coverFile) {
        coverUrl = supabase.storage.from("restaurants").getPublicUrl(`${data.id}/${coverFile.name}`).data.publicUrl;
      }
    }
  } catch (err) {
    // Gracefully ignore missing bucket errors so the menu still renders
    console.error("Storage error:", err);
  }

  const themeName = (data.theme_preset as ThemePreset) || "default";
  const ThemeComponent = themes[themeName] || themes.default;

  return <ThemeComponent data={{ ...data, coverUrl }} />;
}
