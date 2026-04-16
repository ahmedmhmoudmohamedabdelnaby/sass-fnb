import React from 'react';

export default function DefaultTheme({ data }: { data: any }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6">
      <header className="max-w-3xl mx-auto rounded-lg bg-white shadow p-8 text-center border-b-[8px] border-black">
        <h1 className="text-4xl font-extrabold tracking-tight">{data.name}</h1>
        <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest text-[#000]">Welcome to our default menu experience.</p>
      </header>

      <main className="max-w-3xl mx-auto mt-8 space-y-12">
        {data.categories?.map((cat: any) => (
          <section key={cat.id} className="space-y-4">
            <h2 className="text-2xl font-bold border-b pb-2">{cat.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {cat.items?.map((item: any) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <span className="font-medium bg-black text-white px-2 py-1 rounded-md text-sm">${item.price}</span>
                  </div>
                  {item.description && <p className="text-gray-500 text-sm mt-2 leading-relaxed">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
