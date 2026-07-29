import React, { useEffect, useRef } from "react";

export default function TechBackground3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let mx = w / 2, my = h / 2;
    let raf;

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);

    // Particles
    const count = 80;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: ["#6C63FF", "#00E5FF", "#8B5CF6", "#00FFA3"][Math.floor(Math.random() * 4)],
    }));

    let t = 0;
    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, w, h);

      // Deep space bg gradient
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h));
      bg.addColorStop(0, "#0B1120");
      bg.addColorStop(1, "#050816");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Perspective grid floor
      ctx.save();
      ctx.strokeStyle = "rgba(108,99,255,0.07)";
      ctx.lineWidth = 1;
      const gridLines = 20;
      const horizon = h * 0.55;
      const vp = { x: w / 2, y: horizon };
      for (let i = -gridLines; i <= gridLines; i++) {
        const x = w / 2 + i * 80;
        ctx.beginPath();
        ctx.moveTo(vp.x, vp.y);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let j = 0; j <= 12; j++) {
        const prog = j / 12;
        const y = horizon + (h - horizon) * prog;
        const spread = prog * w * 0.9;
        ctx.beginPath();
        ctx.moveTo(w / 2 - spread / 2, y);
        ctx.lineTo(w / 2 + spread / 2, y);
        ctx.stroke();
      }
      ctx.restore();

      // Mouse spotlight glow
      const spot = ctx.createRadialGradient(mx, my, 0, mx, my, 280);
      spot.addColorStop(0, "rgba(108,99,255,0.08)");
      spot.addColorStop(1, "transparent");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, w, h);

      // Nebula orb 1
      const g1 = ctx.createRadialGradient(w * 0.25, h * 0.3, 0, w * 0.25, h * 0.3, 300);
      g1.addColorStop(0, "rgba(108,99,255,0.12)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // Nebula orb 2
      const g2 = ctx.createRadialGradient(w * 0.75, h * 0.2, 0, w * 0.75, h * 0.2, 250);
      g2.addColorStop(0, "rgba(0,229,255,0.08)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Particles + connections
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw connections
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(108,99,255,${0.15 * (1 - dist / 120)})`;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  );
}
