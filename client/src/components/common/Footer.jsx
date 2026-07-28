import React from "react";
import { Mail, ArrowUp, Sparkles } from "lucide-react";

function XIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
            <path d="M18.9 2h3.3l-7.2 8.2L23.5 22h-6.7l-5.2-6.8L5.6 22H2.3l7.7-8.8L1.8 2h6.8l4.7 6.2L18.9 2Zm-1.2 17.9h1.8L7.6 4H5.7l12 15.9Z" />
        </svg>
    );
}

function LinkedinIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
            <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.4 8h4.2v14H.4V8Zm7.4 0h4v1.9h.1c.56-1.05 1.94-2.16 3.99-2.16 4.27 0 5.06 2.81 5.06 6.47V22h-4.2v-7c0-1.67-.03-3.82-2.33-3.82-2.33 0-2.69 1.82-2.69 3.7V22h-4.2V8Z" />
        </svg>
    );
}

function InstagramIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const footerSections = [
        {
            title: "PRODUCT",
            links: [
                { label: "3D Builder", href: "#3d-builder" },
                { label: "Features", href: "#features" },
                { label: "3D Presets", href: "#presets" },
                { label: "Pricing", href: "#pricing" },
                { label: "Pipeline", href: "#pipeline" },
            ],
        },
        {
            title: "COMPANY",
            links: [
                { label: "About", href: "#features" },
                { label: "Blog", href: "#blog" },
                { label: "Contact", href: "#contact" },
            ],
        },
        {
            title: "RESOURCES",
            links: [
                { label: "Docs", href: "#features" },
                { label: "Customization Guide", href: "#features" },
                { label: "3D Engine", href: "#features" },
            ],
        },
        {
            title: "LEGAL",
            links: [
                { label: "Privacy", href: "#features" },
                { label: "Terms", href: "#features" },
                { label: "Cookies", href: "#features" },
            ],
        },
    ];

    return (
        <footer className="w-full bg-black text-white border-t border-zinc-900/80 font-sans relative z-10 select-none">
            <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6">

                {/* Brand Column */}
                <div className="md:col-span-4 flex flex-col gap-5">
                    <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                            <div className="h-full w-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
                                <div className="h-2.5 w-2.5 rotate-45 border-2 border-cyan-400 bg-blue-600/40" />
                            </div>
                        </div>
                        <span className="font-black text-sm tracking-[0.2em] bg-gradient-to-r from-white via-zinc-200 to-blue-400 bg-clip-text text-transparent uppercase font-sans">
                            Shapentic
                        </span>
                    </div>

                    <p className="text-zinc-400 text-xs leading-relaxed max-w-[280px] font-normal">
                        Next-generation 3D Website Builder for cinematic scroll experiences — powered by AI frame sequences.
                    </p>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 w-fit">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>All Engine Nodes Operational</span>
                    </div>

                    {/* Social Icons Array */}
                    <div className="flex items-center gap-2.5 mt-2">
                        {[
                            { icon: <XIcon className="h-3.5 w-3.5" />, href: "#" },
                            { icon: <LinkedinIcon className="h-3.5 w-3.5" />, href: "#" },
                            { icon: <InstagramIcon className="h-3.5 w-3.5" />, href: "#" },
                            { icon: <Mail className="h-3.5 w-3.5" />, href: "#contact" },
                        ].map((social, index) => (
                            <a
                                key={index}
                                href={social.href}
                                className="h-9 w-9 rounded-xl border border-zinc-900 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-200"
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Directory Columns */}
                <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-4">
                    {footerSections.map((section) => (
                        <div key={section.title} className="flex flex-col gap-4">
                            <h4 className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-300 uppercase">
                                {section.title}
                            </h4>
                            <ul className="flex flex-col gap-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-zinc-400 hover:text-white text-xs transition-colors duration-200 font-normal"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-6 py-6 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
                <div>
                    © {new Date().getFullYear()} Shapentic 3D Studio. All rights reserved.
                </div>
                <button
                    onClick={scrollToTop}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                    <span>Back to Top</span>
                    <ArrowUp className="h-3.5 w-3.5" />
                </button>
            </div>
        </footer>
    );
}
