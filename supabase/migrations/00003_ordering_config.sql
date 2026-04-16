-- Add ordering configuration columns to restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS whatsapp_number text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS order_types_enabled jsonb DEFAULT '["dine_in", "delivery", "pickup"]'::jsonb;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EGP';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS tagline text;

COMMENT ON COLUMN restaurants.whatsapp_number IS 'WhatsApp number for receiving orders (with country code, e.g. +201234567890)';
COMMENT ON COLUMN restaurants.order_types_enabled IS 'JSON array of enabled order types: dine_in, delivery, pickup';
COMMENT ON COLUMN restaurants.currency IS 'Currency symbol/code for menu prices';
COMMENT ON COLUMN restaurants.tagline IS 'Short restaurant tagline shown on public menu';

-- Update the RPC to include the new columns
CREATE OR REPLACE FUNCTION get_restaurant_data(lookup_slug text)
RETURNS json LANGUAGE plpgsql AS $$
DECLARE res json;
BEGIN
  SELECT row_to_json(r) INTO res FROM (
    SELECT rest.id, rest.name, rest.slug, rest.theme_preset, rest.is_active,
      rest.whatsapp_number, rest.order_types_enabled, rest.currency, rest.tagline,
      (SELECT json_agg(cat_row) FROM (
          SELECT c.id, c.name, c.order_idx,
            (SELECT json_agg(item_row) FROM (
                SELECT m.id, m.name, m.description, m.price, m.image_url, m.order_idx,
                  (SELECT json_agg(v) FROM variants v WHERE v.menu_item_id = m.id AND v.is_deleted = false) as variants,
                  (SELECT json_agg(a) FROM addons a WHERE a.menu_item_id = m.id AND a.is_deleted = false) as addons
                FROM menu_items m WHERE m.category_id = c.id AND m.is_deleted = false ORDER BY m.order_idx ASC
              ) item_row) as items
          FROM categories c WHERE c.restaurant_id = rest.id AND c.is_deleted = false ORDER BY c.order_idx ASC
        ) cat_row) as categories
    FROM restaurants rest WHERE rest.slug = lookup_slug AND rest.is_active = true AND rest.is_deleted = false
  ) r;
  RETURN res;
END; $$;
