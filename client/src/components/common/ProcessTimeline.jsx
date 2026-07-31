import React from "react";
import { Search, Lightbulb, Image, Cpu, Box, CheckCircle2 } from "lucide-react";

const steps = [
  { num: "01", title: "Discovery", desc: "We map your brand strategy, audience, and visual guidelines into a creative direction.", icon: Search },
  { num: "02", title: "Concept", desc: "Moodboards, camera motion curves, and lighting aesthetics aligned to your identity.", icon: Lightbulb },
  { num: "03", title: "Storyboard", desc: "Frame-by-frame pre-visualization specifying timing, angles, and cinematic transitions.", icon: Image },
  { num: "04", title: "AI Generation", desc: "Neural models produce 3D depth maps, texture passes, and frame continuations at speed.", icon: Cpu },
  { num: "05", title: "3D Production", desc: "Geometry modeling, lighting physics, particle dynamics, and 4K ray-traced rendering.", icon: Box },
  { num: "06", title: "Final Delivery", desc: "Color grading, sound sync, and deployment-ready delivery within 48 hours.", icon: CheckCircle2 },
];

export default function ProcessTimeline() {
  return (
    <section id="process" className="w-full bg-transparent py-24 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#2997ff] text-sm font-medium mb-4">How We Work</p>
          <h2 className="text-4xl sm:text-6xl font-bold text-[#f5f5f7] tracking-tight leading-[1.07] mb-5">
            Six steps.<br />Flawless results.
          </h2>
          <p className="text-[#86868b] text-lg max-w-lg mx-auto leading-relaxed">
            A streamlined workflow engineered to deliver 3D master renders on time, every time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.07] rounded-3xl overflow-hidden border border-white/[0.07]">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="group bg-black p-8 hover:bg-[#111] transition-colors duration-300 cursor-default">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#2997ff]/10 transition-colors">
                    <Icon className="h-5 w-5 text-[#86868b] group-hover:text-[#2997ff] transition-colors" />
                  </div>
                  <span className="text-2xl font-bold text-[#333] group-hover:text-[#444] transition-colors font-mono">{s.num}</span>
                </div>
                <h3 className="text-[#f5f5f7] font-semibold text-base mb-2 group-hover:text-white transition-colors">{s.title}</h3>
                <p className="text-[#86868b] text-sm leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
