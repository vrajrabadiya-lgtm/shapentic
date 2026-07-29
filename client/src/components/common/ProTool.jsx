import React from "react";
import { Layers, FolderDown, MessageSquareCode, Box, Clock } from "lucide-react";

export default function ProToolsSection() {
    const features = [
        {
            title: "Multi-Video Continuation",
            desc: "Chain multiple videos end-to-end for longer scroll animations. First frame of each picks up perfectly from the last.",
            icon: Layers,
            // Large 2-column highlight card with blue border tint
            gridClass: "md:col-span-2 border-blue-500/30 bg-zinc-950/40 shadow-[inset_0_1px_20px_rgba(59,130,246,0.05)]",
            iconColor: "text-blue-400"
        },
        {
            title: "Full-Stack Export",
            desc: "Download a ZIP with frontend + backend starter. Includes Express API.",
            icon: FolderDown,
            gridClass: "md:col-span-1 border-zinc-800/60 bg-zinc-950",
            iconColor: "text-zinc-500"
        },
        {
            title: "Iterative Chat Editing",
            desc: "Chat with AI to change copy, move sections, adjust colors — live.",
            icon: MessageSquareCode,
            gridClass: "md:col-span-1 border-zinc-800/60 bg-zinc-950",
            iconColor: "text-zinc-500"
        },
        {
            title: "Product Injection",
            desc: "Upload product photos and tell AI where to place them directly in 3D.",
            icon: Box,
            gridClass: "md:col-span-1 border-zinc-800/60 bg-zinc-950",
            iconColor: "text-zinc-500"
        },
        {
            title: "Adjustable FPS",
            desc: "Slide between 10–40 FPS to control frame density and scroll speed.",
            icon: Clock,
            gridClass: "md:col-span-1 border-zinc-800/60 bg-zinc-950",
            iconColor: "text-zinc-500"
        }
    ];

    return (
        <section id="pro-tools" className="w-full text-[#f5f5f7] py-20 px-6 border-t border-white/10 bg-transparent">
            <div className="max-w-7xl mx-auto flex flex-col items-center">

                {/* Badge Category */}
                <div className="inline-flex items-center gap-1.5 mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2997ff] border border-[#2997ff]/30 bg-[#2997ff]/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                    <Box className="h-3.5 w-3.5 text-[#2997ff]" />
                    Pro Tools
                </div>

                {/* Main Copy Headers */}
                <div className="text-center max-w-3xl mb-16">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-[#f5f5f7]">
                        Built for <span className="text-[#2997ff]">serious websites</span>
                    </h2>
                    <p className="text-[#86868b] text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal">
                        Presets give you polished UI instantly; the 3D builder adds cinematic scroll on top. Chain videos, swap media, layer elements over frames, and export production-ready code.
                    </p>
                </div>

                {/* Asymmetric Bento Box Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
                    {features.map((feat, index) => {
                        const Icon = feat.icon;

                        return (
                            <div
                                key={index}
                                className={`group p-8 rounded-2xl border border-white/10 bg-[#1c1c1e] flex flex-col justify-between min-h-[260px] transition-all duration-300 hover:border-white/20 hover:bg-[#242426] hover:shadow-2xl ${index === 0 ? "md:col-span-2 border-[#2997ff]/30" : ""}`}
                            >
                                {/* Framed Mini Square Icon Container */}
                                <div className="h-11 w-11 rounded-xl bg-[#2c2c2e] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Icon className="h-5 w-5 text-[#2997ff]" />
                                </div>

                                {/* Content Block */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold text-[#f5f5f7] mb-2 tracking-tight">
                                        {feat.title}
                                    </h3>
                                    <p className="text-[#86868b] text-xs leading-relaxed max-w-sm">
                                        {feat.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}