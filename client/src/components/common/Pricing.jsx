import React, { useState } from "react";
import { Check, Sparkles, HelpCircle, ArrowRight } from "lucide-react";

export default function PricingSection() {
    const [billingCycle, setBillingCycle] = useState("monthly");

    const tiers = [
        {
            name: "Starter",
            price: billingCycle === "monthly" ? "$0" : "$0",
            period: "forever",
            desc: "Perfect for experimenting with AI cinematic scroll physics.",
            features: [
                "3 Active projects",
                "Up to 120 frames per site",
                "Standard rendering queue",
                "HTML/CSS web exports",
            ],
            cta: "Launch Workspace",
            featured: false,
            borderColor: "border-zinc-900 bg-zinc-950/20",
            buttonStyle: "border border-zinc-800 text-zinc-300 bg-zinc-950 hover:text-white hover:border-zinc-700"
        },
        {
            name: "Pro Production",
            price: billingCycle === "monthly" ? "$39" : "$29",
            period: "month",
            desc: "Built for serious creators shipping production-ready 3D architectures.",
            features: [
                "Unlimited active projects",
                "Full 400+ frames per site density",
                "Priority Neural Engine compute",
                "Full-stack code export (Express + React)",
                "Adjustable 10–40 FPS parameters",
                "Multi-video continuation pipeline"
            ],
            cta: "Upgrade to Pro",
            featured: true,
            borderColor: "border-blue-500/30 bg-zinc-950/60 shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)]",
            buttonStyle: "bg-white text-black hover:bg-zinc-200"
        },
        {
            name: "Studio Core",
            price: billingCycle === "monthly" ? "$149" : "$119",
            period: "month",
            desc: "For scale operations requiring hyper-linear customized engines.",
            features: [
                "Everything in Pro Production",
                "Dedicated custom model fine-tuning",
                "Zero-knowledge infrastructure keys",
                "Direct API engineering support",
                "Uncapped simultaneous rendering",
            ],
            cta: "Contact Architecture",
            featured: false,
            borderColor: "border-zinc-900 bg-zinc-950/20",
            buttonStyle: "border border-zinc-800 text-zinc-300 bg-zinc-950 hover:text-white hover:border-zinc-700"
        }
    ];

    return (
        <section id="pricing" className="w-full text-[#f5f5f7] py-24 px-6 border-t border-white/10 bg-transparent">
            <div className="max-w-7xl mx-auto flex flex-col items-center">

                {/* Micro Category Tag */}
                <div className="inline-flex items-center gap-1.5 mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2997ff] border border-[#2997ff]/30 bg-[#2997ff]/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                    Scalable Compute
                </div>

                {/* Typography Heading Set */}
                <div className="text-center max-w-2xl mb-12">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-[#f5f5f7]">
                        Predictable <span className="text-[#2997ff]">pipelines</span>
                    </h2>
                    <p className="text-[#86868b] text-sm md:text-base leading-relaxed font-normal">
                        Choose the rendering bandwidth your workload commands. Save up to 20% on annual commitments.
                    </p>
                </div>

                {/* Billing Cycle Switcher */}
                <div className="flex items-center bg-[#1c1c1e] border border-white/10 p-1 rounded-full mb-20">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${billingCycle === "monthly" ? "bg-[#2997ff] text-white" : "text-[#86868b] hover:text-[#f5f5f7]"}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle("annual")}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${billingCycle === "annual" ? "bg-[#2997ff] text-white" : "text-[#86868b] hover:text-[#f5f5f7]"}`}
                    >
                        Annual (-20%)
                    </button>
                </div>

                {/* Tiers Grid Card System */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {tiers.map((tier, index) => (
                        <div
                            key={index}
                            className={`relative rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 group hover:border-white/20 hover:bg-[#242426] ${
                                tier.featured
                                    ? "bg-[#1c1c1e] border-[#2997ff]/40 shadow-2xl"
                                    : "bg-[#161617] border-white/10"
                            }`}
                        >
                            {/* Pro Badge Accent */}
                            {tier.featured && (
                                <div className="absolute -top-3.5 left-8 bg-[#2997ff] text-white font-mono text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <Sparkles className="h-2.5 w-2.5 fill-white" />
                                    Most Demanded
                                </div>
                            )}

                            {/* Core Price Meta */}
                            <div>
                                <span className="text-sm font-bold tracking-wide text-[#f5f5f7] block mb-1">
                                    {tier.name}
                                </span>
                                <p className="text-[#86868b] text-xs leading-relaxed min-h-[40px] mb-6 font-normal">
                                    {tier.desc}
                                </p>

                                <div className="flex items-baseline gap-1.5 mb-8">
                                    <span className="text-4xl md:text-5xl font-black tracking-tight text-[#f5f5f7]">
                                        {tier.price}
                                    </span>
                                    <span className="text-[#86868b] text-xs font-medium">
                                        / {tier.period}
                                    </span>
                                </div>

                                <div className="h-[1px] bg-white/10 w-full mb-8" />

                                {/* Feature Inclusions Vector List */}
                                <ul className="space-y-4 mb-12">
                                    {tier.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-3 text-xs text-[#f5f5f7]">
                                            <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${tier.featured ? 'bg-[#2997ff]/20 text-[#2997ff] border border-[#2997ff]/30' : 'bg-white/10 text-[#86868b]'}`}>
                                                <Check className="h-2.5 w-2.5" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Dynamic Trigger CTA */}
                            <button className={`w-full font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${tier.featured ? "bg-[#2997ff] text-white hover:bg-[#0077ed]" : "bg-[#2c2c2e] text-[#f5f5f7] hover:bg-[#3a3a3c]"}`}>
                                <span>{tier.cta}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Micro Guarantee Disclaimer Footer */}
                <div className="mt-16 flex items-center gap-2 text-[#86868b] text-xs font-medium">
                    <HelpCircle className="h-3.5 w-3.5 text-[#2997ff]" />
                    <span>Need a dedicated high-volume custom multi-GPU engine node?</span>
                    <a href="#contact" className="text-[#2997ff] hover:underline transition-colors">Talk to infrastructure.</a>
                </div>

            </div>
        </section>
    );
}