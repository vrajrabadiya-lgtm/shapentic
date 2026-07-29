import React from "react";
import { Eye, ArrowUpRight, Layers2 } from "lucide-react";

export default function PresetsSection() {
    const presets = [
        {
            title: "OrbitCRM",
            type: "Agency / Glass UI",
            desc: "Nature backdrop with floating frosted glass cards. Built for agency portfolios.",
            accent: "#2997ff",
        },
        {
            title: "VisionForge",
            type: "AI Video / Cinematic",
            desc: "Ultra-dark noir styling with slow cinematic camera pans and AI-generated frames.",
            accent: "#2997ff",
        },
        {
            title: "Meridian",
            type: "Premium / Scroll Theatre",
            desc: "Deep textured landscapes locked to your scrolling speed. Maximum scroll drama.",
            accent: "#2997ff",
        },
    ];

    return (
        <section id="presets" className="w-full py-28 px-6 relative">
            {/* Ambient glow */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[500px] h-[500px] bg-[#0c1c38]/25 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full bg-[#2997ff]/10 border border-[#2997ff]/25 text-[#2997ff] text-[10px] font-bold tracking-[0.18em] uppercase">
                            <Layers2 className="h-3 w-3" />
                            Preset Library
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#f5f5f7] mb-4">
                            Proven cinematic presets
                        </h2>
                        <p className="text-[#86868b] text-sm md:text-base max-w-xl">
                            Inspired by real launches. Click any card to preview prompts and open them inside the interactive builder.
                        </p>
                    </div>
                    <button className="inline-flex items-center gap-2 text-xs font-semibold text-[#f5f5f7] border border-white/10 px-5 py-2.5 rounded-full bg-[#1c1c1e] hover:bg-[#242426] hover:border-white/20 transition-all duration-200 shrink-0">
                        Browse presets
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Preset Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {presets.map((preset, i) => (
                        <div
                            key={i}
                            className="group relative rounded-2xl border border-white/[0.07] bg-[#141416] p-7 flex flex-col justify-between min-h-[320px] transition-all duration-300 hover:border-white/15 hover:bg-[#1c1c1e] hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                        >
                            {/* Top label */}
                            <div>
                                <span className="text-[10px] font-bold tracking-[0.15em] text-[#2997ff] uppercase block mb-2">
                                    {preset.type}
                                </span>
                                <h3 className="text-xl font-bold text-[#f5f5f7] mb-2">{preset.title}</h3>
                                <p className="text-[#86868b] text-xs leading-relaxed">{preset.desc}</p>
                            </div>

                            {/* Preview area */}
                            <div className="mt-8 h-36 rounded-xl bg-[#1c1c1e] border border-white/[0.07] relative overflow-hidden flex items-center justify-center group-hover:border-white/15 transition-all duration-300">
                                {/* Gradient fill on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#2997ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="h-10 w-10 rounded-full bg-black/50 border border-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 backdrop-blur-md z-10">
                                    <Eye className="h-4 w-4 text-[#2997ff]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}