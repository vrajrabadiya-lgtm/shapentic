import { useEffect, useRef } from "react";

const stats = [
  { value: 500, suffix: "+", label: "Projects Delivered" },
  { value: 120, suffix: "+", label: "Global Clients" },
  { value: 18, suffix: "+", label: "Countries Reached" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
];

function AnimatedStat({ stat }) {
  const ref = useRef(null);
  const ran = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !ran.current) {
        ran.current = true;
        const start = performance.now();
        const duration = 1800;
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * stat.value) + stat.suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat]);

  return (
    <div className="group flex flex-col items-center justify-center text-center rounded-3xl bg-[#12141D] border border-sky-500/20 p-5 sm:p-10 hover:border-sky-500/40 hover:bg-[#12141D] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(56,189,248,0.08)] transition-all duration-300">
      <span ref={ref} className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums mb-2 sm:mb-3 bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        0{stat.suffix}
      </span>
      <span className="text-slate-400 text-xs sm:text-sm font-medium tracking-wide">{stat.label}</span>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section id="stats" className="w-full bg-transparent py-16 sm:py-24 px-4 sm:px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Proven Results at{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">Global Scale</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Numbers that reflect our relentless commitment to visual excellence and client outcomes.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {stats.map((s, i) => <AnimatedStat key={i} stat={s} />)}
        </div>
      </div>
    </section>
  );
}
