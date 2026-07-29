import React from "react";
import { Check, Minus } from "lucide-react";

const rows = [
    { metric: "Scroll-driven 3D animation",  Shapentic: "Frame-extracted video", framework: "CSS transforms only" },
    { metric: "AI video generation",          Shapentic: "Built-in Runway/Sora",  framework: "Not supported" },
    { metric: "Export format",               Shapentic: "Full-stack ZIP",        framework: "Static HTML only" },
    { metric: "Multi-video chaining",        Shapentic: "Unlimited segments",    framework: "Not available" },
    { metric: "FPS control",                 Shapentic: "10–40 FPS adjustable",  framework: "Fixed" },
    { metric: "AI chat editing",             Shapentic: "Live section editing",   framework: "Manual code only" },
];

export default function CompareMatrix() {
    return (
        <section className="w-full py-28 px-6 relative">
            {/* Ambient glow */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[500px] h-[500px] bg-[#12192e]/30 rounded-full blur-[160px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Section Header — centered, same badge pattern */}
                <div className="flex flex-col items-center text-center mb-14">
                    <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full bg-[#2997ff]/10 border border-[#2997ff]/25 text-[#2997ff] text-[10px] font-bold tracking-[0.18em] uppercase">
                        <Check className="h-3 w-3" />
                        Comparison
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#f5f5f7]">
                        Where Shapentic fits in the stack
                    </h2>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#141416] shadow-[0_0_60px_rgba(0,0,0,0.6)]">
                    <table className="w-full min-w-[560px] text-left border-collapse text-xs font-medium">
                        <thead>
                            <tr className="border-b border-white/[0.07] text-[9px] font-bold tracking-[0.2em] uppercase">
                                <th className="p-5 text-[#86868b]">Capability Metric</th>
                                <th className="p-5 text-[#2997ff] font-black bg-[#2997ff]/[0.07] border-x border-white/[0.07]">
                                    Shapentic Core
                                </th>
                                <th className="p-5 text-[#86868b]">Traditional Builders</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {rows.map((row, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-5 text-[#f5f5f7]">{row.metric}</td>
                                    <td className="p-5 text-[#f5f5f7] font-semibold bg-[#2997ff]/[0.04] border-x border-white/[0.07]">
                                        <div className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-[#2997ff] stroke-[2.5] shrink-0" />
                                            {row.Shapentic}
                                        </div>
                                    </td>
                                    <td className="p-5 text-[#86868b]">
                                        <div className="flex items-center gap-2">
                                            <Minus className="h-3.5 w-3.5 text-[#3a3a3c] shrink-0" />
                                            {row.framework}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}