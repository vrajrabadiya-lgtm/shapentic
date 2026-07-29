import React, { useRef, useEffect, useState } from "react";

export default function HeroSection() {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);
    let raf;

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    let t = 0;
    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, w, h);

      // Black base
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // Apple-style subtle glow at top center
      const g1 = ctx.createRadialGradient(w / 2, -h * 0.1, 0, w / 2, -h * 0.1, h * 0.9);
      g1.addColorStop(0, "rgba(41,151,255,0.07)");
      g1.addColorStop(0.5, "rgba(41,151,255,0.02)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // Floating 3D wireframe sphere — Apple Vision Pro style
      const cx = w / 2, cy = h / 2;
      const r = Math.min(w, h) * 0.28;
      const rings = 8;

      for (let i = 0; i < rings; i++) {
        const phi = (Math.PI / rings) * i + t * 0.3;
        const sr = r * Math.sin(phi);
        const y = cy + r * Math.cos(phi) * 0.35;
        const alpha = 0.08 + 0.05 * Math.sin(t + i);

        ctx.beginPath();
        ctx.ellipse(cx, y, sr, sr * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Vertical rings
      for (let j = 0; j < 6; j++) {
        const theta = (Math.PI / 6) * j + t * 0.2;
        const alpha = 0.05 + 0.03 * Math.sin(t * 0.7 + j);
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * Math.sin(theta) * 0.5, r * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(41,151,255,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Slow rotating outer ring
      ctx.beginPath();
      ctx.ellipse(cx, cy, r + 20, (r + 20) * 0.35, t * 0.1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="relative w-full min-h-[96vh] flex flex-col items-center justify-center overflow-hidden bg-black text-center px-6 pt-24 pb-20">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#2997ff]/6 rounded-full blur-[120px] pointer-events-none" />

      <div className={`relative z-10 flex flex-col items-center max-w-5xl mx-auto transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

        {/* Apple eyebrow label */}
        <p className="text-[#2997ff] text-sm font-medium tracking-wide mb-5">
          AI Powered 3D Studio
        </p>

        {/* Main headline — Apple display style */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-[#f5f5f7] leading-[1.05] tracking-tight mb-6 max-w-4xl">
          Transform Ideas Into<br />
          <span className="text-white">Cinematic 3D Experiences</span>
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-[#86868b] max-w-2xl leading-relaxed mb-10 font-normal">
          We create next-generation AI-powered 3D animations, immersive product visualizations,
          and premium marketing content that elevates brands worldwide.
        </p>

        {/* Apple-style CTA pair */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <a
            href="#contact"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2997ff] text-white font-medium text-sm hover:bg-[#2383e2] transition-colors"
          >
            Start Your Project
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#showcase"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 text-[#f5f5f7] font-medium text-sm hover:border-white/40 hover:text-white transition-all"
          >
            View Portfolio
          </a>
        </div>

        {/* 3D Canvas */}
        <div className="relative w-full max-w-lg h-[340px] mx-auto">
          <canvas ref={canvasRef} className="w-full h-full" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono text-[#86868b]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff] animate-pulse" />
            Interactive 3D Viewport
          </div>
        </div>
      </div>
    </section>
  );
}
