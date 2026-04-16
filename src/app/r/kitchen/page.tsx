"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateOrderStatus } from "@/app/actions/orders";

type Order = {
  id: string;
  sequence_number: number;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  fulfillment_type: string;
  status: string;
  created_at: string;
};

const MOCK_RESTAURANT_ID = "mock-uuid-restaurant-123";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const cursorRef = useRef<number>(0); 
  const supabase = createClient();

  useEffect(() => {
    async function fetchDelta(sinceSequence: number) {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", MOCK_RESTAURANT_ID)
        .in("status", ["pending", "preparing", "ready"])
        .gt("sequence_number", sinceSequence)
        .order("sequence_number", { ascending: true });
        
      if (data && data.length > 0) {
        const highestSeq = Math.max(...data.map(d => d.sequence_number));
        if (highestSeq > cursorRef.current) cursorRef.current = highestSeq;

        setOrders(curr => {
          const map = new Map(curr.map(o => [o.id, o]));
          data.forEach(o => map.set(o.id, o));
          return Array.from(map.values()).sort((a,b) => a.sequence_number - b.sequence_number);
        });
      }
    }
    
    fetchDelta(0);

    const channel = supabase
      .channel(`orders:restaurant_id=${MOCK_RESTAURANT_ID}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `restaurant_id=eq.${MOCK_RESTAURANT_ID}` },
        (payload) => {
           const newOrder = payload.new as Order;
           if (newOrder.sequence_number > cursorRef.current) cursorRef.current = newOrder.sequence_number;
           
           setOrders((curr) => {
             if (curr.some(o => o.id === newOrder.id)) return curr;
             return [...curr, newOrder].sort((a,b) => a.sequence_number - b.sequence_number);
           });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `restaurant_id=eq.${MOCK_RESTAURANT_ID}` },
        (payload) => {
          setOrders((curr) => {
            const updated = payload.new as Order;
            if (updated.sequence_number > cursorRef.current) cursorRef.current = updated.sequence_number;
            
            if (["completed", "cancelled"].includes(updated.status)) return curr.filter((o) => o.id !== updated.id);
            return curr.map((o) => (o.id === updated.id ? updated : o));
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED" || status === "TIMED_OUT" || status === "CLOSED") {
          const currentlyOffline = status !== "SUBSCRIBED";
          
          if (!currentlyOffline && isOffline) {
            console.log(`Kitchen Sync Reconnected. Fetching deltas against sequence cursor: ${cursorRef.current}`);
            fetchDelta(cursorRef.current);
          }
          
          setIsOffline(currentlyOffline);
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [supabase, isOffline]);

  const handleStatusChange = async (orderId: string, currentStatus: string, nextStatus: string) => {
    try {
      const result = await updateOrderStatus(orderId, nextStatus, currentStatus);
      if (result?.error === "conflict") {
         alert(result.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 text-black font-sans relative">
      {isOffline && (
        <div className="absolute top-0 left-0 w-full bg-red-600 text-white p-3 text-center animate-pulse font-bold border-b border-red-700 shadow-lg">
          Connection Lost! Operating in Offline Mode. 
        </div>
      )}
      <h1 className={`text-4xl font-black mb-8 tracking-tight ${isOffline ? 'mt-12' : ''}`}>Kitchen POS Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-bold border-b p-4 bg-zinc-100 rounded-t-xl text-zinc-900 border-zinc-200 uppercase tracking-widest text-sm">Pending Queue</h2>
          <div className="p-4 space-y-4">
            {orders.filter((o) => o.status === "pending").map((o) => (
              <div key={o.id} className="border border-zinc-200 bg-white p-5 rounded-lg shadow-sm hover:border-zinc-400 transition-colors">
                <p className="font-bold text-lg">{o.customer_name}</p>
                <button
                  onClick={() => handleStatusChange(o.id, o.status, "preparing")}
                  disabled={isOffline}
                  className="w-full mt-5 bg-black text-white text-sm font-bold py-3 rounded-lg shadow-md transition disabled:opacity-50"
                >
                  Start Preparing
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Preparing */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-bold border-b p-4 bg-amber-100 rounded-t-xl text-amber-900 border-amber-200 uppercase tracking-widest text-sm">Preparing</h2>
          <div className="p-4 space-y-4">
            {orders.filter((o) => o.status === "preparing").map((o) => (
              <div key={o.id} className="border border-zinc-200 bg-white p-5 rounded-lg shadow-sm hover:border-zinc-400 transition-colors">
                <p className="font-bold text-lg">{o.customer_name}</p>
                <button
                  onClick={() => handleStatusChange(o.id, o.status, "ready")}
                  disabled={isOffline}
                  className="w-full mt-5 bg-black text-white text-sm font-bold py-3 rounded-lg shadow-md transition disabled:opacity-50"
                >
                  Mark Ready
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Ready */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-bold border-b p-4 bg-emerald-100 rounded-t-xl text-emerald-900 border-emerald-200 uppercase tracking-widest text-sm">Ready For Pickup</h2>
          <div className="p-4 space-y-4">
            {orders.filter((o) => o.status === "ready").map((o) => (
              <div key={o.id} className="border border-zinc-200 bg-white p-5 rounded-lg shadow-sm hover:border-zinc-400 transition-colors">
                <p className="font-bold text-lg">{o.customer_name}</p>
                <button
                  onClick={() => handleStatusChange(o.id, o.status, "completed")}
                  disabled={isOffline}
                  className="w-full mt-5 bg-emerald-600 text-white text-sm font-bold py-3 rounded-lg shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  Finish & Complete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
