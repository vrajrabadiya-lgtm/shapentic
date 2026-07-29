import React from "react";
import { Box, Video, User, Layers, Building2, Activity, Cpu, Sparkles, Wand2, MonitorPlay } from "lucide-react";

const services = [
  { title: "3D Product Animation", desc: "Hyper-realistic product reveals with dynamic exploded views and cinematic PBR lighting.", icon: Box },
  { title: "AI Video Generation", desc: "Diffusion-driven 3D video synthesis with frame-perfect continuity and AI upscaling.", icon: Video },
  { title: "Character Animation", desc: "Photorealistic character rigging, facial capture, and emotional motion sequences.", icon: User },
  { title: "Product Visualization", desc: "High-resolution studio renders, 360° rotators, and real-time material customization.", icon: Layers },
  { title: "Architectural Walkthrough", desc: "Immersive 3D interior & exterior flythroughs with real-time lighting physics.", icon: Building2 },
  { title: "Medical Animation", desc: "Cellular simulations, anatomical mechanisms, and biotech visual explanations.", icon: Activity },
  { title: "Industrial Simulation", desc: "Machinery breakdowns, fluid dynamics, and manufacturing process visualizations.", icon: Cpu },
  { title: "Advertising Animation", desc: "3D commercial spots optimized for TV, web, and social media brand campaigns.", icon: Sparkles },
  { title: "Motion Graphics", desc: "Futuristic HUD interfaces, kinetic typography, and 3D visual FX systems.", icon: Wand2 },
  { title: "Interactive 3D Web", desc: "WebGL & Three.js 3D scenes embedded directly into web platforms.", icon: MonitorPlay },
];

export default function ServicesSection() {
  return (
    <section id="services" className="w-full bg-black py-28 px-6">
      <div className="max-w-[980px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#2997ff] text-sm font-medium mb-4">Our Capabilities</p>
          <h2 className="text-4xl sm:text-6xl font-bold text-[#f5f5f7] tracking-tight leading-[1.07] mb-5">
            Everything you need.<br />Nothing you don't.
          </h2>
          <p className="text-[#86868b] text-lg max-w-xl mx-auto leading-relaxed">
            From Hollywood-grade CGI to real-time WebGL — we engineer visuals that captivate audiences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.07] rounded-3xl overflow-hidden border border-white/[0.07]">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="group bg-black p-8 flex flex-col gap-4 hover:bg-[#111] transition-colors duration-300 cursor-default"
              >
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#2997ff]/10 transition-colors">
                  <Icon className="h-5 w-5 text-[#86868b] group-hover:text-[#2997ff] transition-colors" />
                </div>
                <div>
                  <h3 className="text-[#f5f5f7] font-semibold text-base mb-1.5 group-hover:text-white transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-[#86868b] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
