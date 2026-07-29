import React from "react";
import { Layers, Video, Clock, Code2, Sparkles, ArrowRight } from "lucide-react";

export default function FeaturesHeroSection() {
    const stats = [
        { icon: Layers,  value: "400+", label: "Frames per Site" },
        { icon: Video,   value: "~8s",  label: "Video Duration" },
        { icon: Clock,   value: "10–40", label: "Adjustable FPS" },
        { icon: Code2,   value: "ZIP",  label: "Ready to Deploy" },
    ];

    return (
        <section id="features-hero" className="w-full py-28 px-6 relative">
            {/* Section ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#2997ff]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Full-width Apple Card */}
                <div className="w-full rounded-[2rem] bg-[#141416] border border-white/[0.08] p-10 md:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-14 relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">

                    {/* Corner accent glow */}
                    <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#2997ff]/8 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#2997ff]/5 rounded-full blur-[80px] pointer-events-none" />

                    {/* Left: Typography + Actions */}
                    <div className="w-full lg:w-1/2 flex flex-col items-start z-10">
                        {/* Eyebrow badge */}
                        <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-[#2997ff]/10 border border-[#2997ff]/25 text-[#2997ff] text-[10px] font-bold tracking-[0.18em] uppercase">
                            <Sparkles className="h-3 w-3" />
                            Shapentic Platform
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6 text-[#f5f5f7]">
                            Build 3D websites{" "}
                            <span className="text-[#2997ff]">10× faster</span>{" "}
                            with AI
                        </h2>

                        <p className="text-[#86868b] text-sm md:text-base leading-relaxed max-w-lg mb-10">
                            Describe what you want once. Our AI generates cinematic motion, extracts frames, and builds a scroll-driven 3D website in minutes — not days. Download the ZIP and ship.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <button className="inline-flex items-center gap-2 bg-[#2997ff] hover:bg-[#0077ed] text-white font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200 shadow-[0_0_20px_rgba(41,151,255,0.3)]">
                                <Sparkles className="h-4 w-4 fill-white" />
                                Start Building Free
                            </button>
                            <button className="inline-flex items-center gap-2 text-sm text-[#f5f5f7] px-6 py-3 rounded-full border border-white/12 bg-white/5 hover:bg-white/10 transition-all duration-200 font-medium">
                                View Pricing
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Right: Stat Cards */}
                    <div className="w-full lg:w-[42%] grid grid-cols-2 gap-4 z-10">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={i}
                                    className="group p-6 rounded-2xl border border-white/[0.07] bg-[#1c1c1e] hover:bg-[#242426] hover:border-white/15 transition-all duration-300 min-h-[140px] flex flex-col justify-between"
                                >
                                    <Icon className="h-5 w-5 text-[#2997ff]" />
                                    <div>
                                        <div className="text-2xl md:text-3xl font-black tracking-tight text-[#f5f5f7] mb-1">
                                            {stat.value}
                                        </div>
                                        <span className="text-[11px] font-medium text-[#86868b] tracking-wide">
                                            {stat.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}