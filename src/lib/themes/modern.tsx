import React from 'react';

export default function ModernTheme({ data }: { data: any }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="relative h-[40vh] w-full bg-zinc-900 border-b border-zinc-800 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
          {data.name}
        </h1>
        <p className="mt-4 text-xs font-medium text-zinc-400 uppercase tracking-[0.3em]">Modern Cuisine Experience</p>
      </div>

      <main className="max-w-4xl mx-auto mt-12 space-y-16 p-6">
        {data.categories?.map((cat: any) => (
          <section key={cat.id} className="space-y-6">
            <h2 className="text-3xl font-light tracking-wide text-zinc-200 border-l-2 border-zinc-700 pl-4">{cat.name}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {cat.items?.map((item: any) => (
                <div key={item.id} className="group relative bg-zinc-900/50 p-6 shadow-2xl border border-zinc-800 hover:border-zinc-500 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-xl text-zinc-100">{item.name}</h3>
                    <span className="font-mono text-zinc-300 bg-zinc-800 px-3 py-1 rounded text-sm">${item.price}</span>
                  </div>
                  {item.description && <p className="text-zinc-500 text-sm leading-relaxed">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
