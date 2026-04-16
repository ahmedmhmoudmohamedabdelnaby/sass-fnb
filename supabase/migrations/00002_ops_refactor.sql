-- Safe schema update, keeping merchant_id for backwards compatibility but making it optional (deprecated) as we pivot to Ops Single Tenant model
ALTER TABLE restaurants
ALTER COLUMN merchant_id DROP NOT NULL;
COMMENT ON COLUMN restaurants.merchant_id IS 'Deprecated - Pivot to Ops Single Tenant.';

-- Non breaking RPC update
CREATE OR REPLACE FUNCTION create_restaurant_flow_v2(p_slug text, p_name text)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE v_res_id uuid; v_cat_id uuid;
BEGIN
  INSERT INTO restaurants (slug, name) VALUES (p_slug, p_name) RETURNING id INTO v_res_id;
  INSERT INTO categories (restaurant_id, name) VALUES (v_res_id, 'Specials') RETURNING id INTO v_cat_id;
  INSERT INTO menu_items (category_id, restaurant_id, name, price) VALUES (v_cat_id, v_res_id, 'Sample Item', 9.99);
  RETURN v_res_id;
END; $$;
