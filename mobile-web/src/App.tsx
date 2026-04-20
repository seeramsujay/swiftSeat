import React from 'react';
import { MessageSquare, Map as MapIcon, Wallet, Bell, Navigation, Clock, ChevronRight, Zap } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden pb-40">
      <div className="bg-mesh" />
      
      {/* Top Nav / Status Bar Offset */}
      <header className="px-8 pt-16 pb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold text-white">SwiftSeat</h1>
          <p className="label-cap mt-1">Stadia Intelligence</p>
        </div>
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center glass shadow-xl">
          <Zap className="w-5 h-5 text-[var(--primary)]" />
        </div>
      </header>

      <main className="px-8 space-y-8">
        {/* Concierge Dialog */}
        <section className="glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MessageSquare className="w-24 h-24" />
          </div>
          
          <div className="space-y-4 relative z-10">
            <h2 className="text-2xl font-bold leading-tight">
              Good evening, <br />
              <span className="text-[var(--primary)]">Marcus.</span>
            </h2>
            <p className="text-[var(--text-dim)] leading-relaxed">
              Based on real-time sensor data, Section 204 is reaching capacity. 
              <span className="text-white font-medium"> Prime Pit BBQ</span> in the West Wing currently has near-zero wait time.
            </p>
            
            <div className="flex items-center gap-5 p-4 rounded-3xl bg-white-5 border border-white-5">
              <div className="p-3 rounded-2xl bg-[var(--tertiary)]/20 pulse-glow">
                <Clock className="w-6 h-6 text-[var(--tertiary)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Prime Pit BBQ</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--tertiary)]" />
                  <p className="text-xs text-[var(--text-dim)] font-medium">4m Estimated wait</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20" />
            </div>
          </div>
        </section>

        {/* Navigation Shortcut */}
        <div className="glass-card py-6 flex items-center justify-between border-l-4 border-l-[var(--primary)]">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/20">
              <Navigation className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Guided Path</p>
              <p className="text-xs text-[var(--text-dim)] font-medium uppercase tracking-widest">Follow blue floor lights</p>
            </div>
          </div>
          <button className="btn-liquid scale-75 origin-right">START</button>
        </div>

        {/* Quick Utilities */}
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card aspect-square flex flex-col items-center justify-center gap-3 border-none hover:bg-white/10 cursor-pointer">
            <div className="w-14 h-14 rounded-3xl bg-[var(--surface-high)] flex items-center justify-center shadow-inner">
              <span className="text-3xl">🍔</span>
            </div>
            <p className="font-bold tracking-tight">Cravings</p>
          </div>
          <div className="glass-card aspect-square flex flex-col items-center justify-center gap-3 border-none hover:bg-white/10 cursor-pointer">
            <div className="w-14 h-14 rounded-3xl bg-[var(--surface-high)] flex items-center justify-center shadow-inner">
              <span className="text-3xl">🚻</span>
            </div>
            <p className="font-bold tracking-tight">Comfort</p>
          </div>
        </div>
      </main>

      {/* Floating Tactical Navigation */}
      <div className="fixed bottom-10 left-8 right-8 z-50">
        <nav className="nav-blur h-20 rounded-[40px] px-8 flex justify-between items-center shadow-2xl">
          <button className="relative group p-2">
            <MessageSquare className="w-7 h-7 text-[var(--primary)] transition-transform group-hover:-translate-y-1" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--primary)]" />
          </button>
          <button className="p-2 transition-opacity hover:opacity-50">
            <MapIcon className="w-7 h-7" />
          </button>
          <button className="p-2 transition-opacity hover:opacity-50">
            <Wallet className="w-7 h-7" />
          </button>
          <button className="p-2 transition-opacity hover:opacity-50">
            <Bell className="w-7 h-7 text-[#ff5252]" />
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;
