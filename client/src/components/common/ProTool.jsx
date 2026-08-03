import React from "react";
import { Layers, FolderDown, MessageSquareCode, Box, Clock } from "lucide-react";

export default function ProToolsSection() {
    const features = [
        {
            title: "Multi-Video Continuation",
            desc: "Chain multiple videos end-to-end for longer scroll animations. First frame of each picks up perfectly from the last.",
            icon: Layers,
            highlight: true,
        },
        {
            title: "Full-Stack Export",
            desc: "Download a ZIP with frontend + backend starter. Includes Express API.",
            icon: FolderDown,
        },
        {
            title: "Iterative Chat Editing",
            desc: "Chat with AI to change copy, move sections, adjust colors — live.",
            icon: MessageSquareCode,
        },
        {
            title: "Product Injection",
            desc: "Upload product photos and tell AI where to place them directly in 3D.",
            icon: Box,
        },
        {
            title: "Adjustable FPS",
            desc: "Slide between 10–40 FPS to control frame density and scroll speed.",
            icon: Clock,
        }
    ];

    return (
        <section id="pro-tools" className="w-full text-[#f5f5f7] py-16 sm:py-20 px-4 sm:px-6 border-t border-white/10 bg-transparent">
            <div className="max-w-7xl mx-auto flex flex-col items-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2997ff] border border-[#2997ff]/30 bg-[#2997ff]/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                    <Box className="h-3.5 w-3.5 text-[#2997ff]" />
                    Pro Tools
                </div>

                {/* Heading */}
                <div className="text-center max-w-3xl mb-12 sm:mb-16">
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 sm:mb-6 text-[#f5f5f7]">
                        Built for <span className="text-[#2997ff]">serious websites</span>
                    </h2>
                    <p className="text-[#86868b] text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal">
                        Presets give you polished UI instantly; the 3D builder adds cinematic scroll on top. Chain videos, swap media, layer elements over frames, and export production-ready code.
                    </p>
                </div>

                {/* Row 1: Highlight wide card + 2 equal cards */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
                    {/* Wide highlight card */}
                    <div className="group md:col-span-2 p-7 sm:p-8 rounded-2xl border border-[#2997ff]/25 bg-[#111827] flex flex-col justify-between min-h-[220px] sm:min-h-[260px] transition-all duration-300 hover:border-[#2997ff]/50 hover:bg-[#131b2e] hover:shadow-[0_0_40px_rgba(41,151,255,0.08)] hover:-translate-y-0.5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-56 h-56 bg-[#2997ff]/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="h-11 w-11 rounded-xl bg-[#2997ff]/10 border border-[#2997ff]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Layers className="h-5 w-5 text-[#2997ff]" />
                        </div>
                        <div className="mt-6 sm:mt-8">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-[#2997ff]/70">Flagship Feature</span>
                                <div className="h-px flex-1 bg-[#2997ff]/15" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#f5f5f7] mb-2 tracking-tight">
                                Multi-Video Continuation
                            </h3>
                            <p className="text-[#86868b] text-xs sm:text-sm leading-relaxed">
                                Chain multiple videos end-to-end for longer scroll animations. First frame of each picks up perfectly from the last.
                            </p>
                        </div>
                    </div>

                    {/* Full-Stack Export */}
                    <div className="group p-7 sm:p-8 rounded-2xl border border-white/10 bg-[#1c1c1e] flex flex-col justify-between min-h-[220px] sm:min-h-[260px] transition-all duration-300 hover:border-white/20 hover:bg-[#242426] hover:-translate-y-0.5">
                        <div className="h-11 w-11 rounded-xl bg-[#2c2c2e] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <FolderDown className="h-5 w-5 text-[#2997ff]" />
                        </div>
                        <div className="mt-8">
                            <h3 className="text-base sm:text-lg font-bold text-[#f5f5f7] mb-2 tracking-tight">Full-Stack Export</h3>
                            <p className="text-[#86868b] text-xs leading-relaxed">
                                Download a ZIP with frontend + backend starter. Includes Express API.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Row 2: Three equal cards */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                    {features.slice(2).map((feat, index) => {
                        const Icon = feat.icon;
                        return (
                            <div
                                key={index}
                                className="group p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#1c1c1e] flex flex-col justify-between min-h-[180px] sm:min-h-[200px] transition-all duration-300 hover:border-white/20 hover:bg-[#242426] hover:-translate-y-0.5"
                            >
                                <div className="h-10 w-10 rounded-xl bg-[#2c2c2e] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Icon className="h-4 w-4 text-[#2997ff]" />
                                </div>
                                <div className="mt-6">
                                    <h3 className="text-base font-bold text-[#f5f5f7] mb-2 tracking-tight">{feat.title}</h3>
                                    <p className="text-[#86868b] text-xs leading-relaxed">{feat.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}