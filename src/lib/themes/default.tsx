"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createOrder } from "@/app/actions/orders";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface CartEntry {
  id: string;
  name: string;
  price: number;
  qty: number;
  image_url?: string;
}

type FulfillmentType = "dine_in" | "delivery" | "pickup";
type CheckoutStep = "type" | "details" | "success";

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */
function fmt(price: number, currency: string) {
  return `${price.toFixed(2)} ${currency}`;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function DefaultTheme({ data }: { data: any }) {
  const currency: string = data.currency || "EGP";
  const enabledTypes: FulfillmentType[] = data.order_types_enabled || ["dine_in", "delivery", "pickup"];

  /* ---- Cart State ---- */
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("type");
  const [fulfillment, setFulfillment] = useState<FulfillmentType | null>(null);
  const [formFields, setFormFields] = useState({ name: "", phone: "", address: "", table: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ order_id?: string; error?: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  /* ---- Derived ---- */
  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const totalQty = useMemo(() => cartItems.reduce((s, i) => s + i.qty, 0), [cartItems]);
  const totalPrice = useMemo(() => cartItems.reduce((s, i) => s + i.price * i.qty, 0), [cartItems]);

  /* ---- Cart Actions ---- */
  const addItem = useCallback((item: any) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: existing
          ? { ...existing, qty: existing.qty + 1 }
          : { id: item.id, name: item.name, price: Number(item.price), qty: 1, image_url: item.image_url },
      };
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      if (existing.qty <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...existing, qty: existing.qty - 1 } };
    });
  }, []);

  /* ---- Category scroll spy ---- */
  useEffect(() => {
    if (!data.categories?.length) return;
    setActiveCategory(data.categories[0]?.id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.getAttribute("data-cat-id"));
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    Object.values(categoryRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [data.categories]);

  const scrollToCategory = (id: string) => {
    categoryRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ---- Checkout Submit ---- */
  const handleSubmit = async () => {
    if (!fulfillment) return;
    setSubmitting(true);
    try {
      const result = await createOrder({
        restaurant_id: data.id,
        fulfillment_type: fulfillment,
        customer_name: formFields.name || undefined,
        customer_phone: formFields.phone || undefined,
        table_number: formFields.table || undefined,
        address: formFields.address || undefined,
        notes: formFields.notes || undefined,
        items: cartItems.map((ci) => ({
          menu_item_id: ci.id,
          name_snapshot: ci.name,
          price_snapshot: ci.price,
          quantity: ci.qty,
        })),
      });
      setOrderResult(result);
      if (result.order_id) {
        setCheckoutStep("success");
      }
    } catch (err: any) {
      setOrderResult({ error: err.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetCheckout = () => {
    setShowCheckout(false);
    setCheckoutStep("type");
    setFulfillment(null);
    setFormFields({ name: "", phone: "", address: "", table: "", notes: "" });
    setOrderResult(null);
    if (orderResult?.order_id) setCart({});
  };

  /* ---- Fulfillment labels & icons ---- */
  const fulfillmentMeta: Record<FulfillmentType, { label: string; icon: string; desc: string }> = {
    delivery: { label: "Delivery", icon: "🚗", desc: "Delivered to your door" },
    dine_in: { label: "Dine In", icon: "🍽️", desc: "Eat at the restaurant" },
    pickup: { label: "Pickup", icon: "🛍️", desc: "Collect your order" },
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-emerald-100" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ---- Google Fonts ---- */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ============================================================ */}
      {/*  HERO / HEADER                                                */}
      {/* ============================================================ */}
      <header className="relative overflow-hidden">
        {data.coverUrl ? (
          <div className="relative h-56 md:h-72 w-full">
            <img src={data.coverUrl} alt={data.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">{data.name}</h1>
              {data.tagline && <p className="text-white/80 mt-1 text-sm md:text-base">{data.tagline}</p>}
              {!data.tagline && <p className="text-white/70 mt-1 text-sm">Seamless ordering experience</p>}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 px-6 py-12 md:py-16 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{data.name}</h1>
            {data.tagline && <p className="text-white/80 mt-2 text-sm md:text-base">{data.tagline}</p>}
            {!data.tagline && <p className="text-white/70 mt-2 text-sm">Seamless ordering experience</p>}
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/*  CATEGORY NAV (sticky)                                        */}
      {/* ============================================================ */}
      {data.categories && data.categories.length > 0 && (
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 py-2">
              {data.categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0
                    ${activeCategory === cat.id
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* ============================================================ */}
      {/*  MENU CONTENT                                                 */}
      {/* ============================================================ */}
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-36">
        {data.categories?.map((cat: any) => (
          <section
            key={cat.id}
            data-cat-id={cat.id}
            ref={(el) => { categoryRefs.current[cat.id] = el; }}
            className="mb-8"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 sticky top-[56px] bg-[#FAFAFA] py-2 z-20 border-b border-gray-100">
              {cat.name}
            </h2>

            <div className="space-y-3">
              {cat.items?.map((item: any) => {
                const inCart = cart[item.id];
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 flex gap-4 items-start shadow-sm border border-gray-50 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Image */}
                    {item.image_url && (
                      <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">{item.name}</h3>
                      {item.description && (
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}
                      <p className="text-emerald-600 font-bold text-sm mt-2">{fmt(Number(item.price), currency)}</p>
                    </div>

                    {/* Add / Quantity Controls */}
                    <div className="flex-shrink-0 flex items-center self-center">
                      {!inCart ? (
                        <button
                          onClick={() => addItem(item)}
                          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md shadow-emerald-200 transition-all duration-150"
                          aria-label={`Add ${item.name} to cart`}
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                          </svg>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-emerald-50 rounded-full px-1 py-1 border border-emerald-100">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 rounded-full bg-white text-emerald-600 font-bold text-lg flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-bold text-emerald-700 text-sm tabular-nums">
                            {inCart.qty}
                          </span>
                          <button
                            onClick={() => addItem(item)}
                            className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-sm hover:bg-emerald-600 transition-colors"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {(!cat.items || cat.items.length === 0) && (
                <div className="text-sm text-gray-400 italic py-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                  Items coming soon.
                </div>
              )}
            </div>
          </section>
        ))}

        {(!data.categories || data.categories.length === 0) && (
          <div className="text-center py-20 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white mt-8">
            <p className="text-lg font-medium">Menu is being prepared</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/*  FLOATING CART BAR                                            */}
      {/* ============================================================ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
          totalQty > 0 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <button
            onClick={() => {
              setShowCheckout(true);
              setCheckoutStep("type");
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-emerald-300/40 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg">
                {totalQty}
              </div>
              <span className="font-semibold text-base">View Cart</span>
            </div>
            <span className="font-bold text-lg">{fmt(totalPrice, currency)}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  CHECKOUT MODAL                                               */}
      {/* ============================================================ */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetCheckout} />

          {/* Modal */}
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            {/* Close */}
            <button
              onClick={resetCheckout}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            {/* ---- STEP: SELECT ORDER TYPE ---- */}
            {checkoutStep === "type" && (
              <div className="p-6 pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Your Order</h2>
                <p className="text-sm text-gray-400 mb-6">Review your items and select order type</p>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map((ci) => (
                    <div key={ci.id} className="flex items-center gap-3">
                      {ci.image_url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={ci.image_url} alt={ci.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{ci.name}</p>
                        <p className="text-xs text-gray-400">{fmt(ci.price, currency)} × {ci.qty}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => removeItem(ci.id)} className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold hover:bg-red-50 hover:text-red-500 transition-colors">−</button>
                        <span className="text-sm font-bold text-gray-700 w-5 text-center tabular-nums">{ci.qty}</span>
                        <button onClick={() => addItem({ id: ci.id, name: ci.name, price: ci.price, image_url: ci.image_url })} className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold hover:bg-emerald-200 transition-colors">+</button>
                      </div>
                      <p className="font-bold text-gray-900 text-sm w-20 text-right tabular-nums">{fmt(ci.price * ci.qty, currency)}</p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-3 border-t border-gray-100 mb-6">
                  <span className="font-semibold text-gray-500 text-sm">Total</span>
                  <span className="font-extrabold text-xl text-gray-900">{fmt(totalPrice, currency)}</span>
                </div>

                {/* Order Type Selection */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">How would you like your order?</p>
                <div className="grid gap-3">
                  {enabledTypes.map((type) => {
                    const meta = fulfillmentMeta[type];
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setFulfillment(type);
                          setCheckoutStep("details");
                        }}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 text-left group active:scale-[0.98]"
                      >
                        <span className="text-2xl">{meta.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{meta.label}</p>
                          <p className="text-xs text-gray-400">{meta.desc}</p>
                        </div>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-gray-300 group-hover:text-emerald-500 transition-colors">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---- STEP: DETAILS FORM ---- */}
            {checkoutStep === "details" && fulfillment && (
              <div className="p-6 pt-8">
                <button
                  onClick={() => setCheckoutStep("type")}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{fulfillmentMeta[fulfillment].icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{fulfillmentMeta[fulfillment].label}</h2>
                    <p className="text-sm text-gray-400">{fmt(totalPrice, currency)} · {totalQty} items</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Name - always shown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={formFields.name}
                      onChange={(e) => setFormFields((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Enter your name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>

                  {/* Phone - for delivery & pickup */}
                  {(fulfillment === "delivery" || fulfillment === "pickup") && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={formFields.phone}
                        onChange={(e) => setFormFields((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="e.g. +20 1234567890"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-300"
                      />
                    </div>
                  )}

                  {/* Address - delivery only */}
                  {fulfillment === "delivery" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Delivery Address</label>
                      <textarea
                        value={formFields.address}
                        onChange={(e) => setFormFields((p) => ({ ...p, address: e.target.value }))}
                        placeholder="Full delivery address..."
                        rows={2}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-300 resize-none"
                      />
                    </div>
                  )}

                  {/* Table - dine_in only */}
                  {fulfillment === "dine_in" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Table Number</label>
                      <input
                        type="text"
                        value={formFields.table}
                        onChange={(e) => setFormFields((p) => ({ ...p, table: e.target.value }))}
                        placeholder="e.g. Table 5"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-300"
                      />
                    </div>
                  )}

                  {/* Notes - always shown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes (optional)</label>
                    <textarea
                      value={formFields.notes}
                      onChange={(e) => setFormFields((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Any special requests..."
                      rows={2}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-300 resize-none"
                    />
                  </div>
                </div>

                {/* Error */}
                {orderResult?.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                    {orderResult.error}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200/50 transition-all duration-200 text-base"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Placing Order...
                    </span>
                  ) : (
                    `Place Order · ${fmt(totalPrice, currency)}`
                  )}
                </button>
              </div>
            )}

            {/* ---- STEP: SUCCESS ---- */}
            {checkoutStep === "success" && (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Order Placed! 🎉</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Your order has been received and is being prepared.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-6 inline-block">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                  <p className="font-mono text-sm font-bold text-gray-700">{orderResult?.order_id?.slice(0, 8)}...</p>
                </div>
                <br />
                <button
                  onClick={resetCheckout}
                  className="bg-gray-900 hover:bg-black text-white font-semibold px-8 py-3 rounded-xl transition-colors active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Footer ---- */}
      <footer className="text-center text-xs text-gray-300 py-6 pb-20">
        Powered by the Platform
      </footer>

      {/* ---- Animations ---- */}
      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .tabular-nums { font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
}
