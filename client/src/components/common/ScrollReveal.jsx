import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function ScrollReveal({ children }) {
    const targetRef = useRef(null);
    
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    // Apple-style signature fluid motion curves (scale up on enter, subtle scale down on exit)
    const rawY = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [90, 0, 0, -40]);
    const rawOpacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0.2]);
    const rawScale = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.93, 1, 1, 0.96]);

    // Apply Apple Physics Spring Smoothing
    const y = useSpring(rawY, { stiffness: 80, damping: 20, mass: 0.8 });
    const opacity = useSpring(rawOpacity, { stiffness: 80, damping: 20 });
    const scale = useSpring(rawScale, { stiffness: 80, damping: 20 });
    
    const lineWidth = useTransform(scrollYProgress, [0, 0.35], ["0%", "100%"]);

    return (
        <div ref={targetRef} className="w-full relative py-12 overflow-hidden">
            {/* Minimalist Apple Progress Accent Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5">
                <motion.div 
                  style={{ width: lineWidth }}
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 opacity-60"
                />
            </div>

            {/* Apple Smooth Spring Reveal Wrapper */}
            <motion.div
                style={{
                    opacity,
                    scale,
                    y,
                    willChange: "transform, opacity"
                }}
                className="w-full origin-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
                {children}
            </motion.div>
        </div>
    );
}