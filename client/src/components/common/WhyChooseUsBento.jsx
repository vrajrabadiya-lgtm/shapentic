import React from "react";
import { Cpu, Zap, Film, RefreshCw, Users, ShieldCheck } from "lucide-react";

export default function WhyChooseUsBento() {
  return (
    <section id="why-us" className="w-full bg-transparent py-16 sm:py-24 px-4 sm:px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[#2997ff] text-xs sm:text-sm font-medium mb-3">The Studio Advantage</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#f5f5f7] tracking-tight leading-[1.07] mb-4 sm:mb-5">
            Why brands choose<br />Shapentic.
          </h2>
          <p className="text-[#86868b] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            We merge neural diffusion with Hollywood-grade 3D to deliver unprecedented visual speed and quality.
          </p>
        </div>

        {/* Row 1 — Big highlight card + stat card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Big card — AI Pipeline */}
          <div className="md:col-span-2 rounded-3xl bg-[#111] border border-white/[0.07] p-6 sm:p-10 flex flex-col justify-between min-h-[260px] sm:min-h-[300px] relative overflow-hidden hover:bg-[#161616] transition-colors group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2997ff]/5 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="h-11 w-11 rounded-2xl bg-[#2997ff]/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Cpu className="h-5 w-5 text-[#2997ff]" />
              </div>
              <p className="text-[#86868b] text-xs font-mono tracking-widest uppercase mb-2">AI Pipeline</p>
              <h3 className="text-xl sm:text-2xl font-bold text-[#f5f5f7] mb-3">AI-Powered 3D Neural Workflow</h3>
              <p className="text-[#86868b] text-sm leading-relaxed max-w-md">
                Custom diffusion models extract 3D depth maps and frame sequences automatically — reducing iteration from weeks to hours.
              </p>
            </div>
            <div className="mt-8 pt-5 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#86868b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#30d158] animate-pulse" />
                Neural Engine Active
              </div>
              <span className="text-[#2997ff] font-bold">10× Faster</span>
            </div>
          </div>

          {/* Ultra-Fast Delivery */}
          <div className="rounded-3xl bg-[#111] border border-white/[0.07] p-6 sm:p-8 flex flex-col justify-between hover:bg-[#161616] transition-colors group">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5 text-[#f5f5f7]" />
              </div>
              <p className="text-[#86868b] text-xs font-mono tracking-widest uppercase mb-2">Speed</p>
              <h3 className="text-xl font-bold text-[#f5f5f7] mb-2">Ultra-Fast Delivery</h3>
              <p className="text-[#86868b] text-sm leading-relaxed">5× faster than traditional CGI studios — no quality compromise.</p>
            </div>
            <p className="text-4xl font-bold text-white mt-6">48h <span className="text-sm text-[#86868b] font-normal">avg turnaround</span></p>
          </div>
        </div>

        {/* Row 2 — Three equal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Cinema-Grade CGI */}
          <div className="rounded-3xl bg-[#111] border border-white/[0.07] p-6 sm:p-8 flex flex-col justify-between hover:bg-[#161616] transition-colors group">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Film className="h-5 w-5 text-[#f5f5f7]" />
              </div>
              <p className="text-[#86868b] text-xs font-mono tracking-widest uppercase mb-2">Fidelity</p>
              <h3 className="text-xl font-bold text-[#f5f5f7] mb-2">Cinema-Grade CGI</h3>
              <p className="text-[#86868b] text-sm leading-relaxed">4K 60FPS ray-traced rendering with physically based materials.</p>
            </div>
            <p className="text-4xl font-bold text-white mt-6">4K <span className="text-sm text-[#86868b] font-normal">60FPS master</span></p>
          </div>

          {/* Flexible Revisions */}
          <div className="rounded-3xl bg-[#111] border border-white/[0.07] p-6 sm:p-8 flex flex-col justify-between hover:bg-[#161616] transition-colors group">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <RefreshCw className="h-5 w-5 text-[#f5f5f7]" />
              </div>
              <p className="text-[#86868b] text-xs font-mono tracking-widest uppercase mb-2">Agility</p>
              <h3 className="text-xl font-bold text-[#f5f5f7] mb-2">Flexible Revisions</h3>
              <p className="text-[#86868b] text-sm leading-relaxed">AI prompt-refinement ensures your final visual matches your brand vision exactly.</p>
            </div>
            <p className="text-4xl font-bold text-white mt-6">100% <span className="text-sm text-[#86868b] font-normal">satisfaction</span></p>
          </div>

          {/* Enterprise — spans full width on sm, 1 col on lg */}
          <div className="sm:col-span-2 lg:col-span-1 rounded-3xl bg-[#111] border border-white/[0.07] p-6 sm:p-8 flex flex-col justify-between hover:bg-[#161616] transition-colors group">
            <div>
              <div className="flex gap-3 mb-6">
                <div className="h-11 w-11 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="h-5 w-5 text-[#f5f5f7]" />
                </div>
                <div className="h-11 w-11 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-5 w-5 text-[#f5f5f7]" />
                </div>
              </div>
              <p className="text-[#86868b] text-xs font-mono tracking-widest uppercase mb-2">Enterprise</p>
              <h3 className="text-xl font-bold text-[#f5f5f7] mb-2">Dedicated Team & IP</h3>
              <p className="text-[#86868b] text-sm leading-relaxed">Dedicated art director + 100% commercial IP transfer on every project.</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-[#2997ff]">
              <ShieldCheck className="h-4 w-4" /> Full IP Ownership
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
