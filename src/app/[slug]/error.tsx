"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Basic catch logging natively to console without external Sentry bindings
    console.error("Boundary Caught Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50 text-zinc-900 border-t-4 border-red-500">
      <h2 className="text-3xl font-black tracking-tight">System Unreachable</h2>
      <p className="mt-2 text-zinc-500 font-medium">We could not load the restaurant data securely.</p>
      <button
        onClick={() => reset()}
        className="mt-8 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white shadow hover:bg-zinc-800 transition-colors"
      >
        Attempt Recovery
      </button>
    </div>
  );
}
