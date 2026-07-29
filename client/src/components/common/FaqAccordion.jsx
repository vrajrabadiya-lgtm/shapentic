import React, { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

const faqs = [
  { q: "What types of 3D animations does Shapentic produce?", a: "We cover the full spectrum: product visualizations, AI-generated video ads, character animation, cinematic scenes, architectural walkthroughs, medical animations, industrial simulations, and interactive WebGL 3D experiences for web platforms." },
  { q: "How does your AI-powered pipeline differ from traditional CGI studios?", a: "Our proprietary neural engine extracts 3D depth maps and generates frame continuations using diffusion models, reducing iteration cycles from weeks to hours ΓÇö typically 5├ù faster than conventional CGI production at Hollywood-grade quality." },
  { q: "What is the typical project turnaround time?", a: "Most standard 3D animation projects deliver the first draft within 48ΓÇô72 hours. Complex cinematic sequences with physics, character rigging, or architectural flythroughs may take 5ΓÇô7 business days for full production." },
  { q: "Do you provide full commercial licensing on all delivered assets?", a: "Yes ΓÇö all projects include 100% commercial IP transfer. You receive full royalty-free ownership of all 3D renders, video files, source files (where applicable), and any custom assets created for your project." },
  { q: "Can Shapentic integrate interactive 3D directly into my website?", a: "Absolutely. We build WebGL / Three.js interactive 3D scenes and React components that embed directly into web platforms ΓÇö including 360┬░ product rotators, animated landing sections, and real-time 3D configurators." },
  { q: "What file formats do you deliver in?", a: "We deliver MP4 (H.264/H.265), ProRes 4K masters, PNG sequences, GLTF/GLB for WebGL, OBJ/FBX for 3D models, and deployment-ready ZIPs. Custom format requests are accommodated per project." },
  { q: "How do revisions work?", a: "Our collaborative AI prompt-refinement system ensures your final visual aligns with your brand. All plans include structured revision rounds, and our dedicated art director will iterate with you until the result is exactly right." },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="w-full bg-[#050816] py-28 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-[#00E5FF] text-[10px] font-mono font-bold tracking-widest uppercase mb-5">
            <Sparkles className="h-3 w-3" /> Common Questions
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-[#6C63FF] to-[#00E5FF] bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-[#94A3B8] text-sm max-w-xl mx-auto">
            Everything you need to know before starting your project with Shapentic.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? "border-[#6C63FF]/40 bg-[#0B1120]" : "border-white/[0.08] bg-[#0B1120]/50 hover:border-white/15"}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer group"
                >
                  <span className={`font-semibold text-sm leading-snug transition-colors ${isOpen ? "text-white" : "text-[#CBD5E1] group-hover:text-white"}`}>
                    {faq.q}
                  </span>
                  <div className={`shrink-0 h-7 w-7 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[#6C63FF] border-[#6C63FF] rotate-180" : "border-white/20 bg-white/5"}`}>
                    <ChevronDown className="h-3.5 w-3.5 text-white" />
                  </div>
                </button>
                <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "300px" : "0px" }}>
                  <p className="px-5 pb-5 text-[#94A3B8] text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
