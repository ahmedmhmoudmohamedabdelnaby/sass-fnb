-- 1. Initial Tables Setup

-- Restaurants
CREATE TABLE restaurants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL, 
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    theme_preset text DEFAULT 'default',
    is_active boolean DEFAULT true,
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Categories
CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid REFERENCES restaurants(id) NOT NULL,
    name text NOT NULL,
    order_idx integer DEFAULT 0,
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Menu Items
CREATE TABLE menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES categories(id) NOT NULL,
    restaurant_id uuid REFERENCES restaurants(id) NOT NULL,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    image_url text,
    order_idx integer DEFAULT 0,
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Variants & Addons
CREATE TABLE variants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid REFERENCES menu_items(id) NOT NULL,
    name text NOT NULL,
    price numeric NOT NULL,
    is_deleted boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE addons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid REFERENCES menu_items(id) NOT NULL,
    name text NOT NULL,
    price numeric NOT NULL,
    is_deleted boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Advanced Order System (POS-lite)

-- Orders (Explicit Monotonic Cursor using bigserial sequence_number)
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_number bigserial NOT NULL,
    restaurant_id uuid REFERENCES restaurants(id) NOT NULL,
    customer_name text,
    customer_phone text,
    fulfillment_type text NOT NULL CHECK (fulfillment_type IN ('dine_in', 'delivery', 'pickup')),
    table_number text,
    address text,
    notes text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) NOT NULL,
    menu_item_id uuid REFERENCES menu_items(id),
    name_snapshot text NOT NULL,
    price_snapshot numeric NOT NULL,
    quantity integer NOT NULL DEFAULT 1
);

-- Delivery Tracking
CREATE TABLE delivery_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) NOT NULL,
    status text NOT NULL CHECK (status IN ('accepted', 'picked_up', 'on_the_way', 'delivered')),
    location_lat numeric,
    location_lng numeric,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Simplified Analytics System (Direct DB hits)
CREATE TABLE restaurant_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid REFERENCES restaurants(id) NOT NULL,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Indexes
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_categories_restaurant_id ON categories(restaurant_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_sequence ON orders(sequence_number); 

-- 5. RPC Setup 
CREATE OR REPLACE FUNCTION get_restaurant_data(lookup_slug text)
RETURNS json LANGUAGE plpgsql AS $$
DECLARE res json;
BEGIN
  SELECT row_to_json(r) INTO res FROM (
    SELECT rest.id, rest.name, rest.slug, rest.theme_preset, rest.is_active,
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

CREATE OR REPLACE FUNCTION create_restaurant_flow(p_merchant_id uuid, p_slug text, p_name text)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE v_res_id uuid; v_cat_id uuid;
BEGIN
  INSERT INTO restaurants (merchant_id, slug, name) VALUES (p_merchant_id, p_slug, p_name) RETURNING id INTO v_res_id;
  INSERT INTO categories (restaurant_id, name) VALUES (v_res_id, 'Specials') RETURNING id INTO v_cat_id;
  INSERT INTO menu_items (category_id, restaurant_id, name, price) VALUES (v_cat_id, v_res_id, 'Sample Item', 9.99);
  RETURN v_res_id;
END; $$;
