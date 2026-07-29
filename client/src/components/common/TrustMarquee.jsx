import React from "react";

const brands = [
  "NVIDIA", "OpenAI", "Unreal Engine", "Epic Games",
  "Sony", "Red Bull", "Tesla", "Apple", "Adobe", "Autodesk",
];

export default function TrustMarquee() {
  const doubled = [...brands, ...brands];
  return (
    <section className="w-full py-8 border-y border-white/[0.07] overflow-hidden bg-black select-none">
      <div className="relative overflow-hidden">
        <div className="flex gap-10 animate-marquee items-center">
          {doubled.map((b, i) => (
            <span key={i} className="text-[#86868b] text-sm font-medium tracking-wide shrink-0 hover:text-[#f5f5f7] transition-colors cursor-default">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
