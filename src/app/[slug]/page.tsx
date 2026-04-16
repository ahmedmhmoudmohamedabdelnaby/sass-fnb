import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { themes, ThemePreset } from "@/lib/themes";

// We utilize Next 14 caching automatically mapping this Server Component fetch to a >2s render capability.
export default async function RestaurantMenuPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  // Single DB RPC execution
  const { data, error } = await supabase.rpc("get_restaurant_data", { lookup_slug: params.slug });

  if (error) {
    console.error("RPC Error:", error);
    return notFound();
  }

  if (!data) {
    return notFound();
  }

  // Choose the static layout Theme
  const themeName = (data.theme_preset as ThemePreset) || "default";
  const ThemeComponent = themes[themeName] || themes.default;

  return <ThemeComponent data={data} />;
}
