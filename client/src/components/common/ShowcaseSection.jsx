import React, { useState } from "react";
import { Sparkles, Play, X, ChevronRight } from "lucide-react";

const categories = ["All", "3D Product", "AI Video", "Character", "Architecture"];

const projects = [
  { id: 1, title: "Cyberpunk Sneaker Drop", category: "3D Product", tag: "Product Viz", thumb: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", accent: "#6C63FF" },
  { id: 2, title: "Neural Cosmos Campaign", category: "AI Video", tag: "Brand Film", thumb: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&q=80", accent: "#00E5FF" },
  { id: 3, title: "Apex Warrior Character", category: "Character", tag: "Game Asset", thumb: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&q=80", accent: "#8B5CF6" },
  { id: 4, title: "Luxury Penthouse Tour", category: "Architecture", tag: "Arch Viz", thumb: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", accent: "#00FFA3" },
  { id: 5, title: "Quantum Watch Reveal", category: "3D Product", tag: "Commercial", thumb: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", accent: "#6C63FF" },
  { id: 6, title: "Generative City Timelapse", category: "AI Video", tag: "AI Cinematic", thumb: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80", accent: "#00E5FF" },
  { id: 7, title: "Sci-Fi Mech Rig", category: "Character", tag: "Animation", thumb: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80", accent: "#8B5CF6" },
  { id: 8, title: "Minimalist Villa Flythrough", category: "Architecture", tag: "Arch Viz", thumb: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80", accent: "#00FFA3" },
];

export default function ShowcaseSection() {
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);

  const filtered = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="showcase" className="w-full bg-transparent py-24 px-6 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-[#8B5CF6] text-[10px] font-mono font-bold tracking-widest uppercase mb-5">
            <Sparkles className="h-3 w-3" /> Portfolio
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.05] mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Masterworks That{" "}
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#00E5FF] to-[#8B5CF6] bg-clip-text text-transparent">
              Define the Future
            </span>
          </h2>
          <p className="text-[#94A3B8] text-base leading-relaxed">
            A curated selection of our most celebrated 3D visual productions across industries and formats.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-5 py-2 rounded-full text-xs font-bold font-mono tracking-wide border transition-all cursor-pointer ${
                filter === c
                  ? "bg-[#6C63FF] border-[#6C63FF] text-white shadow-[0_0_20px_rgba(108,99,255,0.45)]"
                  : "bg-white/5 border-white/10 text-[#94A3B8] hover:border-white/25 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => setModal(p)}
              className="group relative rounded-2xl overflow-hidden border border-white/[0.08] cursor-pointer hover:border-[#6C63FF]/40 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)] transition-all duration-300"
            >
              <img src={p.thumb} alt={p.title} className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/50 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              <span
                className="absolute top-3 left-3 text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border"
                style={{ color: p.accent, borderColor: `${p.accent}55`, backgroundColor: `${p.accent}18` }}
              >
                {p.tag}
              </span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-11 w-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-sm font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.title}</h3>
                <p className="text-[10px] font-mono text-[#475569] mt-1">{p.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox modal */}
      {modal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-6" onClick={() => setModal(null)}>
          <div className="relative max-w-xl w-full bg-[#0B1120] border border-white/10 rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(null)} className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
            <img src={modal.thumb} alt={modal.title} className="w-full h-64 object-cover" />
            <div className="p-6">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase block mb-2" style={{ color: modal.accent }}>{modal.tag}</span>
              <h3 className="text-xl font-black text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{modal.title}</h3>
              <p className="text-[#94A3B8] text-xs leading-relaxed mb-6">
                A cinematic 3D masterwork crafted using Shapentic's AI-driven production pipeline ΓÇö hyper-detailed materials, physically accurate lighting, and frame-perfect motion design.
              </p>
              <a href="#contact" onClick={() => setModal(null)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00E5FF] text-white text-xs font-bold hover:shadow-[0_0_20px_rgba(108,99,255,0.5)] transition-all">
                Start Similar Project <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
