import React from "react";
import { Layers, FolderDown, MessageSquareCode, Box, Clock } from "lucide-react";

export default function ProToolsSection() {
    const features = [
        {
            title: "Multi-Video Continuation",
            desc: "Chain multiple videos end-to-end for longer scroll animations. First frame of each picks up perfectly from the last.",
            icon: Layers,
            wide: true,
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
        },
    ];

    return (
        <section id="pro-tools" className="w-full py-28 px-6 relative">
            {/* Section ambient glow */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[600px] h-[600px] bg-[#0c1c38]/30 rounded-full blur-[160px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full bg-[#2997ff]/10 border border-[#2997ff]/25 text-[#2997ff] text-[10px] font-bold tracking-[0.18em] uppercase">
                        <Box className="h-3 w-3" />
                        Pro Tools
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[#f5f5f7] mb-5">
                        Built for <span className="text-[#2997ff]">serious websites</span>
                    </h2>
                    <p className="text-[#86868b] text-sm md:text-base leading-relaxed max-w-xl">
                        Presets give you polished UI instantly; the 3D builder adds cinematic scroll on top. Chain videos, swap media, layer elements over frames, and export production-ready code.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feat, i) => {
                        const Icon = feat.icon;
                        return (
                            <div
                                key={i}
                                className={`group p-8 rounded-2xl border border-white/[0.07] bg-[#141416] hover:bg-[#1c1c1e] hover:border-white/15 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-300 min-h-[260px] flex flex-col justify-between ${feat.wide ? "md:col-span-2 border-[#2997ff]/15 bg-[#0d1520]" : ""}`}
                            >
                                {/* Icon Node */}
                                <div className="h-11 w-11 rounded-xl bg-[#1c1c1e] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                                    <Icon className={`h-5 w-5 ${feat.wide ? "text-[#2997ff]" : "text-[#86868b] group-hover:text-[#2997ff]"} transition-colors`} />
                                </div>

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