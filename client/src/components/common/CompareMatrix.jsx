import React from "react";
import { Check, Minus } from "lucide-react";

export default function CompareMatrix() {
    const rows = [
        { metric: "Website presets gallery", Shapentic: "50+ templates", framework: "—" },
        { metric: "AI prompt-to-site", Shapentic: "Full pipeline", framework: "Partial" },
        { metric: "3D motion architecture", Shapentic: "Native scroll frames", framework: "WebGL (Heavy Tax)" },
        { metric: "Code asset export style", Shapentic: "HTML / Tailwind / JS", framework: "Locked ecosystems" },
        { metric: "Hosting obligations", Shapentic: "Completely Optional", framework: "Bundled mandatory" },
    ];

    return (
        <section className="w-full bg-black text-white py-24 px-6 border-t border-zinc-900">
            <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl md:text-4xl font-bold tracking-tight mb-12 text-center">Where Shapentic fits in the stack</h3>

                <div className="w-full overflow-x-auto border border-white/10 rounded-2xl bg-zinc-900/40 backdrop-blur-xl shadow-2xl">
                    <table className="w-full min-w-[600px] text-left border-collapse text-xs font-medium">
                        <thead>
                            <tr className="border-b border-white/10 text-zinc-400 text-[10px] font-bold tracking-wider uppercase">
                                <th className="p-4">Capability Metric</th>
                                <th className="p-4 text-white font-black bg-blue-500/10 border-x border-white/10">Shapentic Core</th>
                                <th className="p-4">Traditional Builders</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {rows.map((row, index) => (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-zinc-300">{row.metric}</td>
                                    <td className="p-4 text-white font-semibold bg-blue-500/5 border-x border-white/10">
                                        <div className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-blue-400 stroke-[3]" />
                                            <span>{row.Shapentic}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-zinc-400">
                                        <div className="flex items-center gap-2">
                                            <Minus className="h-3.5 w-3.5 text-zinc-600" />
                                            <span>{row.framework}</span>
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