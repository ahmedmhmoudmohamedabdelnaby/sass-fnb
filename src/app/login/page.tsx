"use client";

import { loginAction } from "@/app/actions/auth";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await loginAction(formData);
    
    // If it returns, there was an error, otherwise it would have redirected.
    if (res?.error) {
      setError(res.error);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Ops Login</h1>
          <p className="mt-2 text-sm text-gray-500">Secure entry to the central control plane.</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Admin Account</label>
            <input 
              type="email" 
              name="email"
              required 
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-black focus:border-black"
              placeholder="admin@platform.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              name="password"
              required 
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-black focus:border-black"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Ops Dashboard"}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            &larr; Back to Platform Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
