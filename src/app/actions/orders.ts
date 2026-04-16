"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";

export type OrderPayload = {
  restaurant_id: string;
  customer_name?: string;
  customer_phone?: string;
  fulfillment_type: "dine_in" | "delivery" | "pickup";
  table_number?: string;
  address?: string;
  notes?: string;
  items: Array<{
    menu_item_id: string;
    name_snapshot: string;
    price_snapshot: number;
    quantity: number;
  }>;
};

export async function createOrder(payload: OrderPayload) {
  if (payload.items.length === 0) return { error: "Cart is empty" };
  
  const supabase = createClient();

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert([{
      restaurant_id: payload.restaurant_id,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      fulfillment_type: payload.fulfillment_type,
      table_number: payload.table_number,
      address: payload.address,
      notes: payload.notes,
      status: "pending"
    }])
    .select("id")
    .single();

  if (orderError || !orderData) {
    console.error("Order Creation Error:", orderError);
    return { error: "Failed to create order trace." };
  }

  const itemsToInsert = payload.items.map(item => ({
    order_id: orderData.id,
    menu_item_id: item.menu_item_id,
    name_snapshot: item.name_snapshot,
    price_snapshot: item.price_snapshot,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);

  if (itemsError) {
    console.error("Order Snapshot Error:", itemsError);
    return { error: "Failed to insert order snapshots." };
  }

  revalidateTag(`orders-${payload.restaurant_id}`);
  return { order_id: orderData.id };
}

async function attemptUpdateWithBackoff(order_id: string, nextStatus: string, expectedCurrentStatus: string, attempts: number = 0): Promise<any> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .match({ id: order_id, status: expectedCurrentStatus })
    .select("id, restaurant_id");

  if (!error && data && data.length > 0) {
    return { success: true, restaurant_id: data[0].restaurant_id };
  }

  if (!error && data && data.length === 0) {
    return { error: "conflict", message: "Conflict Error: Order was updated or transitioned by another user. Please refresh." };
  }

  if (attempts < 3) {
    const delayMs = Math.pow(2, attempts) * 500; 
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return attemptUpdateWithBackoff(order_id, nextStatus, expectedCurrentStatus, attempts + 1);
  }

  console.warn(`Update Exhausted: Order ${order_id} failed transitioning to ${nextStatus}`);
  return { error: "network", message: "Failed to update order systematically after multiple network retry attempts." };
}

export async function updateOrderStatus(order_id: string, nextStatus: string, expectedCurrentStatus: string) {
  const result = await attemptUpdateWithBackoff(order_id, nextStatus, expectedCurrentStatus, 0);

  if (result.success && result.restaurant_id) {
    revalidateTag(`orders-${result.restaurant_id}`);
  }

  return result;
}
