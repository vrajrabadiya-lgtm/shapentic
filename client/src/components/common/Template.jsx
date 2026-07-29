import React from "react";
import { Layers2, ArrowUpRight, Terminal, Flame, Sparkles } from "lucide-react";

export default function TemplatesShowcase() {
    const templates = [
        {
            title: "Meridian",
            subtitle: "Cinematic scroll",
            subdomain: "meridian.shapentic.space",
            tags: ["Scroll Theatre", "Volume Dash", "Textures"],
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2070"
        },
        {
            title: "TripVault",
            subtitle: "Travel Experience",
            subdomain: "tripvault.shapentic.space",
            tags: ["Travel", "SaaS", "Glass Sky"],
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070"
        },
        {
            title: "Shopnest",
            subtitle: "Ecommerce Platform",
            subdomain: "shopnest.shapentic.space",
            tags: ["Ecommerce", "Framer", "3D Objects"],
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070"
        },
        {
            title: "OrbitCRM",
            subtitle: "Agency CRM",
            subdomain: "orbitcrm.shapentic.space",
            tags: ["Agency", "Glass UI", "Nebula V2"],
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070"
        },
        {
            title: "SyncBase",
            subtitle: "Team Collaboration",
            subdomain: "syncbase.shapentic.space",
            tags: ["Productivity", "SaaS", "Light UI"],
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070"
        },
        {
            title: "StackForge",
            subtitle: "Dev Platform",
            subdomain: "stackforge.shapentic.space",
            tags: ["Dev Tools", "Dark", "Bold World"],
            image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=2070"
        },
        {
            title: "VisionForge",
            subtitle: "AI Video Studio",
            subdomain: "visionforge.shapentic.space",
            tags: ["AI", "Video", "Cinematic"],
            image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=2070"
        }
    ];

    return (
        <section id="templates" className="w-full py-28 px-6 relative">
            {/* Ambient glow */}
            <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-[#151224]/35 rounded-full blur-[160px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="mb-20">
                    <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full bg-[#2997ff]/10 border border-[#2997ff]/25 text-[#2997ff] text-[10px] font-bold tracking-[0.18em] uppercase">
                        <Layers2 className="h-3 w-3" />
                        Production Blueprints
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[#f5f5f7] mb-5 max-w-3xl">
                        Immersive scroll-reactive templates
                    </h2>
                    <p className="text-[#86868b] text-sm md:text-base leading-relaxed max-w-xl">
                        Seven cinematic 3D starters. AI generates motion, extracts frames, and ships deployment-ready sites instantly.
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((tmpl, i) => (
                        <div
                            key={i}
                            className={`group rounded-2xl border border-white/[0.07] bg-[#141416] overflow-hidden flex flex-col transition-all duration-500 hover:border-white/15 hover:bg-[#1c1c1e] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] ${i % 3 === 1 ? "lg:translate-y-8" : i % 3 === 2 ? "lg:translate-y-16" : ""}`}
                        >
                            {/* Preview Image */}
                            <div className="relative h-56 bg-[#0d0d0f] overflow-hidden">
                                <img
                                    src={tmpl.image}
                                    alt={`${tmpl.title} preview`}
                                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent" />

                                {/* macOS-style browser bar */}
                                <div className="absolute top-0 left-0 right-0 h-6 bg-black/50 backdrop-blur-sm flex items-center px-3 gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                                    <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                                </div>

                                {/* Live badge */}
                                <div className="absolute top-4 right-3 px-2.5 py-1 bg-black/60 text-[9px] font-mono rounded-full flex items-center gap-1.5 border border-white/10 backdrop-blur-sm">
                                    <div className="w-1.5 h-1.5 bg-[#30d158] rounded-full animate-pulse" />
                                    LIVE
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-5">
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7]">
                                            {tmpl.title}
                                        </h3>
                                        <p className="text-[#86868b] text-xs mt-1">{tmpl.subtitle}</p>
                                    </div>
                                    <span className="text-[9px] font-mono text-[#86868b] bg-[#1c1c1e] border border-white/[0.07] px-2.5 py-1 rounded-full">
                                        v1.0.4
                                    </span>
                                </div>

                                {/* Subdomain row */}
                                <div className="font-mono text-xs text-[#86868b] flex items-center gap-2 mb-5 bg-[#1c1c1e] p-3 rounded-xl border border-white/[0.07]">
                                    <Terminal className="h-3.5 w-3.5 text-[#2997ff] shrink-0" />
                                    <span className="truncate">{tmpl.subdomain}</span>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {tmpl.tags.map((tag, ti) => (
                                        <span key={ti} className="text-[10px] px-2.5 py-1 bg-[#1c1c1e] border border-white/[0.07] rounded-full text-[#86868b]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA */}
                                <button className="mt-auto w-full bg-[#2997ff] hover:bg-[#0077ed] text-white text-sm font-semibold rounded-xl p-3.5 flex items-center justify-between transition-all duration-200 shadow-[0_4px_14px_rgba(41,151,255,0.25)]">
                                    <span className="flex items-center gap-2">
                                        <Flame className="h-4 w-4" />
                                        Launch Blueprint
                                    </span>
                                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="flex flex-col items-center mt-24 text-center">
                    <a href="#3d-builder">
                        <button className="inline-flex items-center gap-3 bg-[#2997ff] hover:bg-[#0077ed] text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-[0_0_30px_rgba(41,151,255,0.3)] group">
                            <Sparkles className="h-5 w-5" />
                            Open Interactive 3D Builder
                            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </a>
                    <p className="text-[#3a3a3c] text-xs font-mono mt-5 tracking-widest">
                        Click any template to load into the AI pipeline
                    </p>
                </div>
            </div>
        </section>
    );
}