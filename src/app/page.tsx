import { ArrowRight, ChefHat, Sparkles, Store, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center p-6 sm:p-24 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none flex justify-center">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-fuchsia-500/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="z-10 text-center max-w-4xl flex flex-col items-center mt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-md shadow-2xl shadow-indigo-500/10 transition-colors hover:bg-white/10 cursor-pointer">
          <Sparkles className="w-4 h-4" />
          <span>The Next-Gen SaaS Platform for F&B</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-gradient max-w-3xl">
          Build your restaurant's digital presence instantly.
        </h1>
        
        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mb-12 font-medium">
          Multi-tenant scalable restaurant infrastructure. Launch beautiful, lightning-fast menus and manage orders from a single powerful dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-32 w-full sm:w-auto h-auto">
          <button className="h-14 px-8 rounded-full bg-white text-black font-semibold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-xl shadow-white/5 whitespace-nowrap">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </button>
          <button className="h-14 px-8 rounded-full bg-white/5 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-md whitespace-nowrap">
            View Live Demo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4 sm:px-0">
          <div className="glow-card bg-white/5 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-start border border-white/10 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Store className="w-6 h-6 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Multi-Tenant Setup</h3>
            <p className="text-muted-foreground text-sm text-left leading-relaxed">Deploy isolated environments for thousands of restaurants with a single codebase and database instance.</p>
          </div>
          
          <div className="glow-card bg-white/5 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-start border border-white/10 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-fuchsia-500/20 group mt-0 md:mt-8">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-fuchsia-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Lightning Fast</h3>
            <p className="text-muted-foreground text-sm text-left leading-relaxed">Edge-cached static pages with Incremental Static Regeneration ensure sub-second global load times.</p>
          </div>

          <div className="glow-card bg-white/5 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-start border border-white/10 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ChefHat className="w-6 h-6 text-emerald-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Advanced Engine</h3>
            <p className="text-muted-foreground text-sm text-left leading-relaxed">Real-time inventory syncing, fully customizable themes, and robust point-of-sale integrations.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
