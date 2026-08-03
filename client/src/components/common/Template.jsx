import React, { useState } from "react";
import { Layers2, ArrowUpRight, Terminal, Flame, Sparkles, Globe, ExternalLink } from "lucide-react";

const templates = [
  {
    title: "Meridian",
    subtitle: "Cinematic scroll",
    subdomain: "meridian.shapentic.space",
    tags: ["Scroll Theatre", "Volume dash", "Textures"],
    accent: "#3B82F6",
    gradient: "from-[#1e3a5f] to-[#0f1f35]",
    dotColor: "#3B82F6",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2070",
  },
  {
    title: "TripVault",
    subtitle: "Travel Experience",
    subdomain: "tripvault.shapentic.space",
    tags: ["Travel", "SaaS", "Glass Sky"],
    accent: "#22D3EE",
    gradient: "from-[#0e2f3f] to-[#071520]",
    dotColor: "#22D3EE",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
  },
  {
    title: "Shopnest",
    subtitle: "Ecommerce Platform",
    subdomain: "shopnest.shapentic.space",
    tags: ["Ecommerce", "Framer", "3D Objects"],
    accent: "#F43F5E",
    gradient: "from-[#3f0e1a] to-[#1a0509]",
    dotColor: "#F43F5E",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070",
  },
  {
    title: "OrbitCRM",
    subtitle: "Agency CRM",
    subdomain: "orbitcrm.shapentic.space",
    tags: ["Agency", "Glass UI", "Nebula V2"],
    accent: "#A855F7",
    gradient: "from-[#2d1a4a] to-[#130b20]",
    dotColor: "#A855F7",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070",
  },
  {
    title: "SyncBase",
    subtitle: "Team Collaboration",
    subdomain: "syncbase.shapentic.space",
    tags: ["Productivity", "SaaS", "Light UI"],
    accent: "#10B981",
    gradient: "from-[#0e2e22] to-[#060f0b]",
    dotColor: "#10B981",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070",
  },
  {
    title: "StackForge",
    subtitle: "Dev Platform",
    subdomain: "stackforge.shapentic.space",
    tags: ["Dev Tools", "Dark", "Bold World"],
    accent: "#8B5CF6",
    gradient: "from-[#2a1a4e] to-[#0e0920]",
    dotColor: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=2070",
  },
  {
    title: "VisionForge",
    subtitle: "AI Video Studio",
    subdomain: "visionforge.shapentic.space",
    tags: ["AI", "Video", "Cinematic"],
    accent: "#F59E0B",
    gradient: "from-[#3d2700] to-[#1a1000]",
    dotColor: "#F59E0B",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=2070",
  },
];

export default function TemplatesShowcase() {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section
      id="templates"
      className="w-full text-[#f5f5f7] py-16 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06] bg-transparent relative overflow-hidden"
    >
      {/* Subtle ambient glows */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#A855F7]/4 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3B82F6]/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Header ── */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-14 sm:mb-20">
          <div>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-1.5 mb-5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#2997ff] border border-[#2997ff]/25 bg-[#2997ff]/8 px-3.5 py-1.5 rounded-full">
              <Layers2 className="h-3.5 w-3.5" />
              Production Blueprints
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 text-[#f5f5f7] leading-[1.02]">
              Immersive scroll-reactive
              <br />
              <span className="bg-gradient-to-r from-[#2997ff] via-[#a78bfa] to-[#f472b6] bg-clip-text text-transparent">
                templates
              </span>
            </h2>
            <p className="text-[#86868b] text-sm sm:text-base leading-relaxed max-w-xl">
              Seven cinematic 3D starters. AI generates motion, extracts frames, and ships deployment-ready sites instantly.
            </p>
          </div>

          {/* CTA */}
          <div className="xl:flex-shrink-0">
            <a href="#3d-builder">
              <button className="inline-flex items-center gap-2.5 bg-white text-black font-bold text-sm px-6 py-3 rounded-full hover:bg-[#f0f0f0] transition-all shadow-[0_8px_30px_rgba(255,255,255,0.1)] group">
                <Sparkles className="h-4 w-4" />
                Open 3D Builder
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </a>
          </div>
        </div>

        {/* ── Featured Template (first card — hero sized) ── */}
        <div className="mb-4 sm:mb-5">
          <div
            className="group relative rounded-3xl overflow-hidden border border-white/[0.07] transition-all duration-500 hover:border-white/15 cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${templates[0].gradient.split(" ")[1].replace("from-[", "").replace("]", "")}, #000)` }}
            onMouseEnter={() => setHoveredId(0)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Left content */}
              <div className="lg:w-[45%] p-8 sm:p-10 flex flex-col justify-between min-h-[280px] lg:min-h-[380px]">
                <div>
                  {/* Browser bar simulation */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                    <Globe className="h-3 w-3 text-[#86868b]" />
                    <span className="text-[10px] font-mono text-[#86868b]">{templates[0].subdomain}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse ml-1" />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-[9px] font-mono font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border"
                      style={{
                        color: templates[0].accent,
                        borderColor: `${templates[0].accent}35`,
                        backgroundColor: `${templates[0].accent}12`,
                      }}
                    >
                      Featured
                    </span>
                    <span className="text-[10px] font-mono text-[#86868b]">v1.0.4</span>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">{templates[0].title}</h3>
                  <p className="text-[#86868b] text-sm mb-6">{templates[0].subtitle}</p>

                  <div className="flex flex-wrap gap-2">
                    {templates[0].tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-3 py-1 bg-white/[0.06] border border-white/[0.08] rounded-full text-[#94A3B8]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="mt-8 self-start flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 group/btn"
                  style={{ background: `linear-gradient(135deg, ${templates[0].accent}, ${templates[0].accent}99)`, boxShadow: `0 8px 32px ${templates[0].accent}30` }}
                >
                  <Flame className="h-4 w-4" />
                  Launch Blueprint
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Right image */}
              <div className="lg:w-[55%] relative min-h-[220px] lg:min-h-[380px] overflow-hidden">
                {/* Browser chrome */}
                <div className="absolute top-0 left-0 right-0 h-7 z-10 bg-black/50 backdrop-blur-md flex items-center px-3 gap-1.5 border-b border-white/[0.06]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="flex-1 mx-3 h-4 bg-white/5 rounded-full flex items-center px-2">
                    <span className="text-[8px] font-mono text-[#86868b] truncate">{templates[0].subdomain}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-[#86868b]" />
                </div>

                <img
                  src={templates[0].image}
                  alt={templates[0].title}
                  className="w-full h-full object-cover pt-7 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent lg:from-transparent" />

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 70% 50%, ${templates[0].accent}10 0%, transparent 70%)` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Standard grid (remaining 6) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {templates.slice(1).map((tmpl, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-white/[0.07] bg-[#0d0d0f] overflow-hidden flex flex-col transition-all duration-400 hover:border-white/15 hover:shadow-[0_16px_48px_rgba(0,0,0,0.7)] cursor-pointer"
              onMouseEnter={() => setHoveredId(index + 1)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image area */}
              <div className="relative h-48 sm:h-52 overflow-hidden">
                {/* Browser chrome */}
                <div className="absolute top-0 left-0 right-0 h-6 z-10 bg-black/60 backdrop-blur-sm flex items-center px-2.5 gap-1 border-b border-white/[0.05]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                    <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="flex-1 mx-2 h-3.5 bg-white/[0.06] rounded-full" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse mr-0.5" />
                </div>

                <img
                  src={tmpl.image}
                  alt={tmpl.title}
                  className="w-full h-full object-cover pt-6 transition-transform duration-600 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/20 to-transparent" />

                {/* Accent hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 100%, ${tmpl.accent}15 0%, transparent 65%)` }}
                />

                {/* Version badge */}
                <div className="absolute top-8 right-3 text-[9px] font-mono text-[#86868b] bg-black/50 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  v1.0.4
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col">
                {/* Subdomain bar */}
                <div className="flex items-center gap-2 mb-4 font-mono text-[10px] text-[#86868b] bg-white/[0.04] border border-white/[0.06] px-3 py-2 rounded-xl">
                  <Terminal className="h-3 w-3 flex-shrink-0" style={{ color: tmpl.accent }} />
                  <span className="truncate">{tmpl.subdomain}</span>
                </div>

                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-[#f5f5f7]">{tmpl.title}</h3>
                    <p className="text-[#86868b] text-xs mt-0.5">{tmpl.subtitle}</p>
                  </div>
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ borderColor: `${tmpl.accent}35`, backgroundColor: `${tmpl.accent}12` }}
                  >
                    <ExternalLink className="h-3 w-3" style={{ color: tmpl.accent }} />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {tmpl.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2.5 py-0.5 rounded-full border text-[#94A3B8]"
                      style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.03)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button
                  className="mt-auto w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 group/btn"
                  style={{
                    borderColor: hoveredId === index + 1 ? `${tmpl.accent}40` : "rgba(255,255,255,0.07)",
                    color: hoveredId === index + 1 ? tmpl.accent : "#94A3B8",
                    backgroundColor: hoveredId === index + 1 ? `${tmpl.accent}08` : "transparent",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Flame className="h-3.5 w-3.5" />
                    Launch Blueprint
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom CTA strip ── */}
        <div className="mt-14 sm:mt-20 flex flex-col items-center text-center gap-5">
          <div className="flex items-center gap-3 text-xs font-mono text-[#475569]">
            <div className="h-px w-12 bg-white/10" />
            or build from scratch
            <div className="h-px w-12 bg-white/10" />
          </div>
          <a href="#3d-builder">
            <button className="group flex items-center gap-3 bg-transparent border border-white/10 text-[#f5f5f7] font-semibold text-sm px-7 py-3.5 rounded-2xl hover:border-white/25 hover:bg-white/[0.04] transition-all">
              <Sparkles className="h-4 w-4 text-[#2997ff]" />
              Open Interactive 3D Builder
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#86868b]" />
            </button>
          </a>
          <p className="text-[#475569] text-[11px] font-mono tracking-widest">
            Click any template to load into the AI pipeline
          </p>
        </div>
      </div>
    </section>
  );
}