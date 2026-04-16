"use server";

import { createClient } from "@/lib/supabase/server";

export async function incrementRestaurantView(restaurant_id: string, ipIdentifier: string) {
  try {
    const supabase = createClient();
    
    // Direct MVP tracking logic natively utilizing Supabase without Redis batching dependencies
    const { error } = await supabase
      .from('restaurant_views')
      .insert([
        {
          restaurant_id: restaurant_id,
          ip_address: ipIdentifier
        }
      ]);

    if (error) {
      console.warn("Analytics insertion bypassed silently", error);
    }
  } catch (err) {
    console.error("Analytics ping failure bypassed silently", err);
  }
}
