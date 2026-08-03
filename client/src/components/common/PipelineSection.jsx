import React from "react";
import { Sparkles, Terminal, Image, Video, Layers, Download } from "lucide-react";

const pipelineSteps = [
  { number: "01", title: "Pick a preset", desc: "Start from production-ready UI — customize copy and media in minutes.", icon: Sparkles },
  { number: "02", title: "Describe", desc: "Tell us the visual atmosphere you want.", icon: Terminal },
  { number: "03", title: "Generate", desc: "AI creates a cinematic keyframe.", icon: Image },
  { number: "04", title: "Animate", desc: "The image becomes a smooth 8s video.", icon: Video },
  { number: "05", title: "Build", desc: "AI extracts frames for a 3D scroll.", icon: Layers },
  { number: "06", title: "Deploy", desc: "Download a ZIP with HTML, CSS, JS.", icon: Download },
];

export default function PipelineSection() {
  return (
    <section id="pipeline" className="w-full text-[#f5f5f7] py-16 sm:py-24 px-4 sm:px-6 border-t border-white/10 bg-transparent select-none">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">

        <div className="inline-flex items-center gap-1.5 mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2997ff] border border-[#2997ff]/30 bg-[#2997ff]/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff] animate-pulse" />
          The Pipeline
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 sm:mb-6 max-w-4xl text-[#f5f5f7]">
          From prompt to <span className="text-[#2997ff]">production</span>
        </h2>

        <p className="text-[#86868b] text-sm md:text-base leading-relaxed max-w-2xl mb-12 sm:mb-16 font-normal">
          Use a stunning preset and edit in place — or describe a 3D scroll site from scratch.
          AI generates motion, extracts frames, and ships production HTML without a long prompt.
        </p>

        {/* Responsive grid: 1 col mobile → 2 cols tablet → 3 cols desktop */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {pipelineSteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div
                key={index}
                className="relative group p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#1c1c1e] flex flex-col items-start text-left transition-all duration-300 hover:border-[#2997ff]/30 hover:bg-[#242426] hover:-translate-y-1 shadow-lg"
              >
                {/* Step number — top right */}
                <span className="absolute top-4 right-5 text-[10px] font-bold tracking-widest text-[#86868b]/50 font-mono">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="h-11 w-11 rounded-xl bg-[#2c2c2e] border border-white/10 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:border-[#2997ff]/30 transition-all">
                  <StepIcon className="h-4 w-4 text-[#2997ff]" />
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold text-[#f5f5f7] mb-2 tracking-tight">{step.title}</h3>
                <p className="text-[#86868b] text-xs leading-relaxed font-normal">{step.desc}</p>

                {/* Bottom connector line for visual flow */}
                <div className="mt-5 pt-4 border-t border-white/[0.06] w-full flex items-center gap-2">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-[#2997ff]/30 to-transparent rounded-full" />
                  <span className="text-[9px] text-[#86868b]/40 font-mono tracking-widest uppercase">step {step.number}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
