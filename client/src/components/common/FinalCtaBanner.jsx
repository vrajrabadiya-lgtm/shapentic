import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCtaBanner() {
  return (
    <section className="w-full py-24 px-6 border-t border-white/10 bg-transparent relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-[#2997ff]/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="rounded-[2.5rem] border border-white/10 bg-[#161617] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">

          {/* Corner glows */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#2997ff]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#2997ff]/6 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2997ff] border border-[#2997ff]/30 bg-[#2997ff]/10 px-3.5 py-1.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff] animate-pulse" />
            Limited Slots Available
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#f5f5f7] leading-[1.05] mb-6"
            style={{ fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
            Ready to Create Something{" "}
            <span className="text-[#2997ff]">Extraordinary?</span>
          </h2>

          {/* Subtext */}
          <p className="text-[#86868b] text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-10 font-normal">
            Book your free 30-minute strategy session. Our creative directors will map your 3D animation vision into a production blueprint — at no cost.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#2997ff] hover:bg-[#0077ed] text-white font-semibold text-sm shadow-lg shadow-[#2997ff]/20 transition-all duration-200 group"
            >
              <Sparkles className="h-4 w-4" />
              Book Free Consultation
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#presets"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/15 bg-[#1c1c1e] hover:bg-[#2c2c2e] hover:border-white/25 text-[#f5f5f7] font-semibold text-sm transition-all duration-200"
            >
              View Our Work
            </a>
          </div>

          {/* Footer note */}
          <p className="mt-8 text-[#86868b] text-xs font-normal">
            No commitment required · 48hr first draft · 100% commercial IP ownership
          </p>

        </div>
      </div>
    </section>
  );
}
