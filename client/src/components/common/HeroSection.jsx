import React, { useState } from "react";
import { Play, Mic, ChevronDown, Send, Box, Layers, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function HeroSection() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await fetch(`${backendUrl}/api/ai/generate-blueprint`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            console.log("AI Blueprint Generation Result:", data);
            
            // Save generated website blueprint/components to sessionStorage
            sessionStorage.setItem("ai_result", JSON.stringify(data));
            
            // Redirect to 3D Builder page which automatically opens preview
            window.location.hash = "#3d-builder";
        } catch (error) {
            console.error("Error generating AI blueprint:", error);
            alert("Failed to connect to AI backend. Make sure the server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans select-none">

            {/* Background Media Container */}
            <div className="absolute inset-0 w-full h-full z-0">
                <img
                    src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80"
                    alt="Cinematic Background"
                    className="w-full h-full object-cover brightness-[0.85] contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
            </div>

            {/* Main Content Workspace Layer */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center text-center mt-20"
            >

                {/* 1. Watch Demo Floating Pill */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/60 hover:bg-zinc-900/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold tracking-wide shadow-2xl transition-all duration-300 mb-6 group cursor-pointer"
                >
                    <Play className="h-3.5 w-3.5 fill-white text-white group-hover:scale-110 transition-transform" />
                    <span>Watch demo</span>
                </motion.button>

                {/* 2. Central Specialized Apple Glassmorphic AI Prompt Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-2xl bg-zinc-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] p-4 text-left mb-6 transition-all duration-300 hover:border-white/25"
                >
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your website..."
                        className="w-full min-h-[80px] bg-transparent text-white text-sm placeholder-zinc-400 resize-none border-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 pt-1 shadow-none"
                    />

                    {/* Action Toolbar Inside Prompt Box */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
                        <div className="flex items-center gap-2">
                            {/* Voice Prompt Icon */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <Mic className="h-4 w-4" />
                            </Button>

                            {/* Build Dropdown Pill */}
                            <Button
                                variant="outline"
                                className="h-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors shadow-none"
                            >
                                <span>Build</span>
                                <ChevronDown className="h-3 w-3 text-zinc-400" />
                            </Button>

                            {/* Asset Mode Dropdown Pill */}
                            <Button
                                variant="outline"
                                className="h-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors shadow-none"
                            >
                                <span>Image and Video</span>
                                <ChevronDown className="h-3 w-3 text-zinc-400" />
                            </Button>
                        </div>

                        {/* Submit Start Button */}
                        <Button
                            onClick={handleStart}
                            disabled={!prompt.trim() || loading}
                            className="h-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 border border-blue-500 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40 transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Send className={`h-3 w-3 ${loading ? "animate-pulse" : ""}`} />
                            <span>{loading ? "Building..." : "Start"}</span>
                        </Button>
                    </div>
                </motion.div>

                {/* Small Notice Label Beneath input block */}
                <p className="text-[10px] font-medium text-zinc-400/80 tracking-wide mb-8">
                    One hero image · One motion video · Scroll-sync prototype (Sign out required)
                </p>

                {/* 3. Bottom Dual Execution Links */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                    {/* White Builder Button */}
                    <a href="#3d-builder" className="w-full sm:w-auto">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button className="flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px] h-auto px-6 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-100 shadow-2xl transition-all duration-200 cursor-pointer">
                                <Box className="h-4 w-4 stroke-[2.5]" />
                                <span>3D Website Builder</span>
                                <span className="text-xs font-bold ml-0.5">→</span>
                            </Button>
                        </motion.div>
                    </a>

                    {/* Blue Preset Button */}
                    <a href="#presets" className="w-full sm:w-auto">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button className="flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px] h-auto px-6 py-3.5 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 shadow-2xl shadow-blue-600/20 transition-all duration-200 cursor-pointer border border-blue-400/30">
                                <Layers className="h-4 w-4" />
                                <span>Build from Preset</span>
                            </Button>
                        </motion.div>
                    </a>
                </div>

            </motion.div>

            {/* 4. Scroll Helper Text Target Indicator */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 opacity-60 pointer-events-none">
                <span className="text-[10px] font-bold text-white tracking-[0.25em] uppercase">Scroll</span>
            </div>

            {/* 5. Floating Bottom Right Guide Button */}
            <Button className="fixed bottom-6 right-6 z-50 h-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black text-xs font-bold shadow-2xl hover:bg-zinc-100 transition-all">
                <HelpCircle className="h-4 w-4 text-purple-600 stroke-[2.5]" />
                <span>Guide</span>
            </Button>

        </section>
    );
}
