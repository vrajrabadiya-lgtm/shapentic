import React, { useState } from "react";
import { Check, Sparkles, HelpCircle, ArrowRight, Zap } from "lucide-react";

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
                "Multi-video continuation pipeline",
            ],
            cta: "Upgrade to Pro",
            featured: true,
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
        },
    ];

    return (
        <section id="pricing" className="w-full py-28 px-6 relative">
            {/* Ambient glow */}
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#2997ff]/4 rounded-full blur-[180px] pointer-events-none" />

            <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">

                {/* Section Header */}
                <div className="flex flex-col items-center text-center mb-14">
                    <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full bg-[#2997ff]/10 border border-[#2997ff]/25 text-[#2997ff] text-[10px] font-bold tracking-[0.18em] uppercase">
                        <Zap className="h-3 w-3" />
                        Scalable Compute
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[#f5f5f7] mb-5">
                        Predictable <span className="text-[#2997ff]">pipelines</span>
                    </h2>
                    <p className="text-[#86868b] text-sm md:text-base leading-relaxed max-w-xl">
                        Choose the rendering bandwidth your workload commands. Save up to 20% on annual commitments.
                    </p>
                </div>

                {/* Billing Switcher */}
                <div className="flex items-center bg-[#141416] border border-white/[0.07] p-1 rounded-full mb-16">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                            billingCycle === "monthly"
                                ? "bg-[#2997ff] text-white shadow-[0_0_12px_rgba(41,151,255,0.4)]"
                                : "text-[#86868b] hover:text-[#f5f5f7]"
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle("annual")}
                        className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                            billingCycle === "annual"
                                ? "bg-[#2997ff] text-white shadow-[0_0_12px_rgba(41,151,255,0.4)]"
                                : "text-[#86868b] hover:text-[#f5f5f7]"
                        }`}
                    >
                        Annual <span className="text-[#30d158]">−20%</span>
                    </button>
                </div>

                {/* Tier Cards */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
                    {tiers.map((tier, i) => (
                        <div
                            key={i}
                            className={`relative rounded-2xl border p-8 flex flex-col justify-between transition-all duration-300 ${
                                tier.featured
                                    ? "bg-[#0d1520] border-[#2997ff]/30 shadow-[0_0_60px_-10px_rgba(41,151,255,0.25)]"
                                    : "bg-[#141416] border-white/[0.07] hover:bg-[#1c1c1e] hover:border-white/15"
                            }`}
                        >
                            {/* Featured badge */}
                            {tier.featured && (
                                <div className="absolute -top-3.5 left-7 bg-[#2997ff] text-white font-mono text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_4px_14px_rgba(41,151,255,0.4)]">
                                    <Sparkles className="h-2.5 w-2.5 fill-white" />
                                    Most Popular
                                </div>
                            )}

                            <div>
                                <span className="text-sm font-bold tracking-wide text-[#f5f5f7] block mb-1">
                                    {tier.name}
                                </span>
                                <p className="text-[#86868b] text-xs leading-relaxed min-h-[40px] mb-6">
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

                                <div className="h-px bg-white/[0.06] w-full mb-8" />

                                <ul className="space-y-3.5 mb-10">
                                    {tier.features.map((feat, fi) => (
                                        <li key={fi} className="flex items-start gap-3 text-xs text-[#f5f5f7]">
                                            <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                                                tier.featured
                                                    ? "bg-[#2997ff]/20 text-[#2997ff] border border-[#2997ff]/30"
                                                    : "bg-white/[0.06] text-[#86868b] border border-white/10"
                                            }`}>
                                                <Check className="h-2.5 w-2.5" />
                                            </div>
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button className={`w-full font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                                tier.featured
                                    ? "bg-[#2997ff] text-white hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(41,151,255,0.3)]"
                                    : "bg-white/[0.06] text-[#f5f5f7] hover:bg-white/10 border border-white/10"
                            }`}>
                                {tier.cta}
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-12 flex items-center gap-2 text-[#86868b] text-xs">
                    <HelpCircle className="h-3.5 w-3.5 text-[#2997ff]" />
                    <span>Need a high-volume custom GPU engine?</span>
                    <a href="#contact" className="text-[#2997ff] hover:underline transition-colors">
                        Talk to infrastructure.
                    </a>
                </div>
            </div>
        </section>
    );
}