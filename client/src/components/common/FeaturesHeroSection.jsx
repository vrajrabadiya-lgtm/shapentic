import React from "react";
import { Layers, Video, Clock, Code2, Sparkles } from "lucide-react";

export default function FeaturesHeroSection() {
    const stats = [
        {
            icon: Layers,
            value: "400+",
            label: "Frames per Site",
        },
        {
            icon: Video,
            value: "~8s",
            label: "Video Duration",
        },
        {
            icon: Clock,
            value: "10–40",
            label: "Adjustable FPS",
        },
        {
            icon: Code2,
            value: "ZIP",
            label: "Ready to Deploy",
        },
    ];

    return (
        <section id="features-hero" className="w-full text-[#f5f5f7] py-16 px-6 border-t border-white/10 bg-transparent">
            <div className="max-w-7xl mx-auto">
                {/* Large Apple Card Container */}
                <div className="w-full rounded-[2.5rem] bg-[#161617] border border-white/10 p-8 md:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl backdrop-blur-2xl">

                    {/* Subtle upper corner ambient glow */}
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2997ff]/10 rounded-full blur-[140px] pointer-events-none" />

                    {/* Left Column: Typography & Actions */}
                    <div className="w-full lg:w-1/2 flex flex-col items-start z-10">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-[#f5f5f7]">
                            Build 3D websites <br />
                            <span className="text-[#2997ff]">10x faster</span> with AI
                        </h2>

                        <p className="text-[#86868b] text-sm md:text-base leading-relaxed max-w-lg mb-10 font-normal">
                            Describe what you want once. Our AI generates cinematic motion, extracts frames, and builds a scroll-driven 3D website in minutes — not days. Download the ZIP and ship.
                        </p>

                        {/* CTA Buttons Layout */}
                        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                            <button className="flex items-center justify-center gap-2 bg-[#2997ff] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-[#0077ed] transition-all shadow-lg shadow-[#2997ff]/20 w-full sm:w-auto">
                                <Sparkles className="h-4 w-4 fill-white" />
                                <span>Start Building Free</span>
                            </button>
                            <button className="flex items-center justify-center font-semibold text-xs sm:text-sm text-[#f5f5f7] px-6 py-3 rounded-full border border-white/15 bg-[#1c1c1e] hover:bg-[#2c2c2e] transition-all w-full sm:w-auto">
                                View Pricing
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Mini Stats Grid */}
                    <div className="w-full lg:w-[45%] grid grid-cols-1 sm:grid-cols-2 gap-4 z-10">
                        {stats.map((stat, index) => {
                            const StatIcon = stat.icon;

                            return (
                                <div
                                    key={index}
                                    className="p-6 rounded-2xl border border-white/10 bg-[#1c1c1e] flex flex-col justify-between min-h-[140px] transition-all duration-300 group hover:border-white/20 hover:bg-[#242426]"
                                >
                                    {/* Icon */}
                                    <StatIcon className="h-5 w-5 text-[#2997ff] group-hover:text-white transition-colors mb-4" />

                                    {/* Numbers/Values */}
                                    <div>
                                        <div className="text-2xl md:text-3xl font-bold tracking-tight text-[#f5f5f7] transition-colors mb-1">
                                            {stat.value}
                                        </div>
                                        {/* Meta Label */}
                                        <span className="text-[11px] font-medium tracking-wide text-[#86868b] block">
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