import React, { useState } from "react";
import { Sparkles, Play, X, ArrowUpRight, ExternalLink } from "lucide-react";

const categories = ["All", "3D Product", "AI Video", "Character", "Architecture"];

const projects = [
  {
    id: 1,
    title: "Cyberpunk Sneaker Drop",
    category: "3D Product",
    tag: "Product Viz",
    thumb: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90",
    accent: "#6C63FF",
    size: "large",
  },
  {
    id: 2,
    title: "Neural Cosmos Campaign",
    category: "AI Video",
    tag: "Brand Film",
    thumb: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=90",
    accent: "#00E5FF",
    size: "small",
  },
  {
    id: 3,
    title: "Apex Warrior Character",
    category: "Character",
    tag: "Game Asset",
    thumb: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=90",
    accent: "#8B5CF6",
    size: "small",
  },
  {
    id: 4,
    title: "Luxury Penthouse Tour",
    category: "Architecture",
    tag: "Arch Viz",
    thumb: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=90",
    accent: "#00FFA3",
    size: "small",
  },
  {
    id: 5,
    title: "Quantum Watch Reveal",
    category: "3D Product",
    tag: "Commercial",
    thumb: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90",
    accent: "#6C63FF",
    size: "large",
  },
  {
    id: 6,
    title: "Generative City Timelapse",
    category: "AI Video",
    tag: "AI Cinematic",
    thumb: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=90",
    accent: "#00E5FF",
    size: "small",
  },
  {
    id: 7,
    title: "Sci-Fi Mech Rig",
    category: "Character",
    tag: "Animation",
    thumb: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=90",
    accent: "#8B5CF6",
    size: "small",
  },
  {
    id: 8,
    title: "Minimalist Villa Flythrough",
    category: "Architecture",
    tag: "Arch Viz",
    thumb: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=90",
    accent: "#00FFA3",
    size: "small",
  },
];

export default function ShowcaseSection() {
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [hovered, setHovered] = useState(null);

  const filtered = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="showcase" className="w-full bg-transparent pt-24 pb-16 sm:pb-24 px-4 sm:px-6 border-t border-white/[0.06] relative overflow-hidden">

      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6C63FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#00E5FF]/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[#8B5CF6] text-[10px] font-mono font-bold tracking-[0.15em] uppercase mb-5">
              <Sparkles className="h-3 w-3" />
              Selected Work
            </div>

            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.02] mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Masterworks
              <br />
              <span className="bg-gradient-to-r from-[#6C63FF] via-[#a78bfa] to-[#00E5FF] bg-clip-text text-transparent">
                That Define
              </span>{" "}
              <span className="text-white">the Future</span>
            </h2>

            <p className="text-[#94A3B8] text-sm sm:text-base leading-relaxed max-w-lg">
              A curated selection of our most celebrated 3D visual productions across industries and formats.
            </p>
          </div>

          {/* Stats row — only desktop */}
          <div className="hidden lg:flex flex-col gap-4 text-right flex-shrink-0">
            {[
              { num: "400+", label: "Projects Shipped" },
              { num: "98%", label: "Client Satisfaction" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.num}</div>
                <div className="text-[11px] text-[#475569] font-mono tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex flex-nowrap sm:flex-wrap gap-2 mb-8 overflow-x-auto pb-1 sm:pb-0 -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold font-mono tracking-wide border transition-all duration-200 cursor-pointer ${
                filter === c
                  ? "bg-[#6C63FF] border-[#6C63FF] text-white shadow-[0_0_16px_rgba(108,99,255,0.5)]"
                  : "bg-white/[0.04] border-white/[0.08] text-[#94A3B8] hover:border-white/20 hover:text-white hover:bg-white/[0.07]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ── Masonry-style Gallery Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
          {filtered.map((p, i) => {
            // Alternating editorial layout: wide → stack of 2 → wide → stack of 2 ...
            // Row pattern (per 3 items in lg): [col-span-7, col-span-5], [col-span-5, col-span-7] ...
            let colClass = "lg:col-span-4"; // default equal thirds
            if (filtered.length >= 3) {
              const group = Math.floor(i / 3);
              const posInGroup = i % 3;
              if (group % 2 === 0) {
                // Pattern A: 7 | 5 | auto
                if (posInGroup === 0) colClass = "lg:col-span-7";
                else if (posInGroup === 1) colClass = "lg:col-span-5";
                else colClass = "lg:col-span-12 sm:col-span-2";
              } else {
                // Pattern B: 5 | 7 | auto
                if (posInGroup === 0) colClass = "lg:col-span-5";
                else if (posInGroup === 1) colClass = "lg:col-span-7";
                else colClass = "lg:col-span-12 sm:col-span-2";
              }
            }
            // For small filtered sets, simpler grid
            if (filtered.length === 1) colClass = "lg:col-span-12";
            if (filtered.length === 2) colClass = "lg:col-span-6";

            const imgH = (colClass.includes("col-span-7") || colClass.includes("col-span-12"))
              ? "h-72 sm:h-80 lg:h-[420px]"
              : "h-64 sm:h-72 lg:h-[340px]";

            return (
              <div
                key={p.id}
                onClick={() => setModal(p)}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                className={`${colClass} group relative rounded-2xl overflow-hidden border border-white/[0.07] cursor-pointer transition-all duration-500 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)]`}
              >
                {/* Image */}
                <img
                  src={p.thumb}
                  alt={p.title}
                  className={`w-full ${imgH} object-cover transition-transform duration-700 group-hover:scale-105`}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Accent glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at center bottom, ${p.accent}18 0%, transparent 70%)` }}
                />

                {/* Top badge */}
                <span
                  className="absolute top-3 left-3 text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border backdrop-blur-sm"
                  style={{ color: p.accent, borderColor: `${p.accent}40`, backgroundColor: `${p.accent}15` }}
                >
                  {p.tag}
                </span>

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="h-12 w-12 rounded-full border border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-end justify-between">
                  <div>
                    <h3
                      className="text-sm sm:text-base font-bold text-white leading-tight"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: `${p.accent}bb` }}>
                      {p.category}
                    </p>
                  </div>
                  <div
                    className="h-7 w-7 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0"
                    style={{ borderColor: `${p.accent}50`, backgroundColor: `${p.accent}15` }}
                  >
                    <ExternalLink className="h-3 w-3" style={{ color: p.accent }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom strip ── */}
        <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
          <p className="text-[#475569] text-xs font-mono tracking-wide">
            {filtered.length} work{filtered.length !== 1 ? "s" : ""} shown
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors group"
          >
            Commission a project
            <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* ── Lightbox Modal ── */}
      {modal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-white/10"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "linear-gradient(145deg, #0d0d0f 0%, #111113 100%)" }}
          >
            {/* Close */}
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Image */}
            <div className="relative">
              <img src={modal.thumb} alt={modal.title} className="w-full h-56 sm:h-72 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-transparent" />

              {/* Accent glow */}
              <div
                className="absolute bottom-0 left-0 right-0 h-24"
                style={{ background: `linear-gradient(to top, ${modal.accent}15, transparent)` }}
              />
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span
                    className="text-[9px] font-mono font-bold tracking-[0.15em] uppercase block mb-2"
                    style={{ color: modal.accent }}
                  >
                    {modal.tag}
                  </span>
                  <h3
                    className="text-xl sm:text-2xl font-black text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {modal.title}
                  </h3>
                </div>
                <div
                  className="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-mono border"
                  style={{ color: modal.accent, borderColor: `${modal.accent}30`, backgroundColor: `${modal.accent}10` }}
                >
                  {modal.category}
                </div>
              </div>

              <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
                A cinematic 3D masterwork crafted using Shapentic's AI-driven production pipeline —
                hyper-detailed materials, physically accurate lighting, and frame-perfect motion design.
              </p>

              <div className="flex items-center gap-3">
                <a
                  href="#contact"
                  onClick={() => setModal(null)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white text-xs font-bold transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${modal.accent}dd, ${modal.accent}99)` }}
                >
                  Start Similar Project
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => setModal(null)}
                  className="px-5 py-3 rounded-2xl border border-white/10 text-[#94A3B8] text-xs font-semibold hover:text-white hover:border-white/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
