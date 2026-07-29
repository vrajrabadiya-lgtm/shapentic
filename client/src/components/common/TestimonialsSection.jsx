import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "Elena Voss",
    role: "CMO, NovaBrand Agency",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    rating: 5,
    quote: "Shapentic delivered a 3D product launch video that completely outperformed our in-house CGI. The AI-accelerated pipeline cut our turnaround from 3 weeks to 48 hours. Absolutely world-class.",
  },
  {
    name: "Arjun Mehta",
    role: "Founder, HyperScale Startups",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    rating: 5,
    quote: "I was skeptical about AI-generated 3D. After our product visualization project with Shapentic, I'm a full convert. The material accuracy was indistinguishable from traditional CGI.",
  },
  {
    name: "Sofia Marchetti",
    role: "Creative Director, Luma Films",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
    rating: 5,
    quote: "We hired Shapentic for our luxury brand's architectural walkthrough. The cinematic quality blew the client away — real-time lighting physics at a price point no traditional firm could match.",
  },
  {
    name: "James Okonkwo",
    role: "Head of Marketing, TeslaVision",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
    rating: 5,
    quote: "The character animation Shapentic produced for our game launch trailer was Oscar-worthy. Facial capture precision and cloth simulation beyond what we expected for the price point.",
  },
];

export default function TestimonialsSection() {
  const [idx, setIdx] = useState(0);
  const t = testimonials[idx];

  return (
    <section id="testimonials" className="w-full bg-[#050816] py-28 px-6 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6C63FF]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-[#6C63FF] text-[10px] font-mono font-bold tracking-widest uppercase mb-5">
            <Sparkles className="h-3 w-3" /> Client Stories
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            What{" "}
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#00E5FF] to-[#8B5CF6] bg-clip-text text-transparent">
              Clients Say
            </span>
          </h2>
        </div>

        <div className="relative rounded-3xl bg-[#0B1120]/80 border border-[#6C63FF]/20 p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <span className="absolute top-6 right-8 text-8xl font-black text-[#6C63FF]/8 leading-none select-none pointer-events-none">"</span>

          <div className="flex gap-1 mb-6">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[#00FFA3] text-[#00FFA3]" />
            ))}
          </div>

          <blockquote className="text-white text-lg sm:text-xl font-medium leading-relaxed mb-10 max-w-2xl">
            "{t.quote}"
          </blockquote>

          <div className="flex items-center gap-4">
            <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover border-2 border-[#6C63FF]/40" />
            <div>
              <p className="text-white font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.name}</p>
              <p className="text-[#94A3B8] text-xs">{t.role}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${i === idx ? "w-8 bg-[#6C63FF]" : "w-2 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIdx((idx - 1 + testimonials.length) % testimonials.length)} className="h-10 w-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setIdx((idx + 1) % testimonials.length)} className="h-10 w-10 rounded-full border border-[#6C63FF]/40 bg-[#6C63FF]/10 flex items-center justify-center text-white hover:bg-[#6C63FF]/20 transition-all cursor-pointer">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
