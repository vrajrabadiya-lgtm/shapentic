import React from "react";
import { Eye, ArrowUpRight } from "lucide-react";

export default function PresetsSection() {
    const presets = [
        { title: "OrbitCRM", type: "Agency / Glass UI", desc: "Nature backdrop with floating frosted glass cards.", color: "from-blue-600/20 to-cyan-500/20" },
        { title: "VisionForge", type: "AI Video / Cinematic", desc: "Ultra-dark noir styling with slow camera pans.", color: "from-purple-600/20 to-pink-500/20" },
        { title: "Meridian", type: "Premium / Scroll Theatre", desc: "Deep textured landscapes locked to your scrolling speed.", color: "from-amber-600/20 to-orange-500/20" },
    ];

    return (
        <section id="presets" className="w-full text-[#f5f5f7] py-20 px-6 border-t border-white/10 bg-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[#f5f5f7]">Proven cinematic presets</h2>
                        <p className="text-[#86868b] text-sm md:text-base max-w-xl font-normal">Inspired by real launches. Click any card to preview prompts and open them inside the interactive builder.</p>
                    </div>
                    <button className="text-xs font-semibold tracking-wider text-[#f5f5f7] transition-all flex items-center gap-1.5 border border-white/15 px-4 py-2 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e]">
                        <span>Browse presets</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {presets.map((preset, index) => (
                        <div key={index} className="group relative rounded-2xl border border-white/10 bg-[#1c1c1e] p-6 flex flex-col justify-between min-h-[320px] transition-all duration-300 hover:border-white/20 hover:bg-[#242426] hover:-translate-y-1 shadow-2xl">
                            <div>
                                <span className="text-[10px] font-bold tracking-widest text-[#2997ff] uppercase block mb-2">{preset.type}</span>
                                <h3 className="text-xl font-bold text-[#f5f5f7]">{preset.title}</h3>
                                <p className="text-[#86868b] text-xs mt-2 leading-relaxed font-normal">{preset.desc}</p>
                            </div>

                            <div className={`mt-8 h-36 rounded-xl bg-[#2c2c2e] border border-white/10 relative overflow-hidden flex items-center justify-center group-hover:border-white/20 transition-all`}>
                                <div className="h-10 w-10 rounded-full bg-[#000000]/70 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 backdrop-blur-md shadow-2xl">
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