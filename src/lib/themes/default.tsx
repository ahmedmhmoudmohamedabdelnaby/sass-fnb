import React from 'react';

export default function DefaultTheme({ data }: { data: any }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100">
      {/* Optional Cover Image Banner */}
      {data.coverUrl && (
        <div className="w-full h-48 md:h-64 lg:h-80 relative bg-gray-100">
          <img 
            src={data.coverUrl} 
            alt={`${data.name} Cover`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        
        {/* Header */}
        <header className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            {data.name}
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Welcome to our digital menu.
          </p>
        </header>

        {/* Categories */}
        <div className="space-y-16">
          {data.categories?.map((cat: any) => (
            <section key={cat.id} className="space-y-6">
              
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">
                {cat.name}
              </h2>
              
              <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">
                {cat.items?.map((item: any) => (
                  <div key={item.id} className="group flex gap-4 items-start">
                    {item.image_url && (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100/50 relative">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                          {item.name}
                        </h3>
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          ${item.price}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-500 text-sm mt-1.5 leading-relaxed pr-6">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!cat.items || cat.items.length === 0) && (
                  <div className="text-sm text-gray-400 italic">
                    Items coming soon.
                  </div>
                )}
              </div>
            </section>
          ))}
          
          {(!data.categories || data.categories.length === 0) && (
            <div className="text-center py-20 text-gray-500 border border-dashed border-gray-200 rounded-2xl">
              This menu is currently empty.
            </div>
          )}
        </div>
        
        <footer className="mt-20 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
          Powered by the Platform
        </footer>
      </main>
    </div>
  );
}
