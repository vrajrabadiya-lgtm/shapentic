import React from "react";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function FinalCtaBanner() {
  return (
    <section className="w-full bg-[#050816] py-28 px-6 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[350px] bg-gradient-to-r from-[#6C63FF]/18 via-[#00E5FF]/12 to-[#8B5CF6]/18 blur-[90px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="rounded-3xl border border-[#6C63FF]/25 bg-[#0B1120]/80 p-10 sm:p-16 text-center shadow-[0_0_80px_rgba(108,99,255,0.18)] relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#6C63FF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-[#00E5FF]/12 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-[#00FFA3] text-[10px] font-mono font-bold tracking-widest uppercase mb-6">
            <Zap className="h-3 w-3" /> Limited Slots Available
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Ready to Create Something{" "}
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#00E5FF] to-[#8B5CF6] bg-clip-text text-transparent">
              Extraordinary?
            </span>
          </h2>

          <p className="text-[#94A3B8] text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Book your free 30-minute strategy session. Our creative directors will map your 3D animation vision into a production blueprint ΓÇö at no cost.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#6C63FF] via-[#8B5CF6] to-[#00E5FF] text-white font-bold text-sm shadow-[0_0_30px_rgba(108,99,255,0.55)] hover:shadow-[0_0_50px_rgba(108,99,255,0.85)] transition-all group"
            >
              <Sparkles className="h-4 w-4" />
              Book Free Consultation
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#showcase"
              className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/25 transition-all"
            >
              View Our Work
            </a>
          </div>

          <p className="mt-8 text-[#475569] text-xs font-mono">
            No commitment required ┬╖ 48hr first draft ┬╖ 100% commercial IP ownership
          </p>
        </div>
      </div>
    </section>
  );
}
