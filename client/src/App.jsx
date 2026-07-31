import React, { useState, useEffect } from "react";
import Navbar from "./components/common/Navbar";
import HeroSection from "./components/common/HeroSection";
import Footer from "./components/common/Footer";
import ShowcaseSection from "./components/common/ShowcaseSection";
import { AnimatedTestimonials } from "./components/ui/animated-testimonials";
import TemplatesShowcase from "./components/common/Template";
import PipelineSection from "./components/common/PipelineSection";
import ProToolsSection from "./components/common/ProTool";
import FeaturesHeroSection from "./components/common/FeaturesHeroSection";
import Builder from "./components/common/Builder";
import PreviewPage from "./pages/PreviewPage";
import FeaturesPage from "./pages/FeaturesPage";
import PresetsPage from "./pages/PresetsPage";
import BlogPage from "./pages/BlogPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";

const testimonialData = [
  {
    quote: "I had a portfolio site idea for 2 years. It built in 8 minutes. I launched the same day.",
    name: "Kenji Nakamura",
    designation: "UI Designer",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop",
  },
  {
    quote: "This platform completely transformed how our team handles production deployments.",
    name: "Sarah Chen",
    designation: "VP of Engineering at CloudSync",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop",
  },
  {
    quote: "The ease of use is simply mind-blowing. Our design-to-code workflow is now twice as fast.",
    name: "Marcus Sterling",
    designation: "Product Designer at LinearFlow",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop",
  },
  {
    quote: "Implementation was incredibly smooth. We were up and running in under an hour.",
    name: "Elena Rostova",
    designation: "Infrastructure Lead at NexusData",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop",
  },
];

const PAGE_HASHES = ["#3d-builder", "#preview", "#features", "#presets", "#blog", "#pricing", "#contact", "#profile"];

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || "");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "";
      setCurrentHash(hash);
      window.scrollTo(0, 0);
      if (!PAGE_HASHES.includes(hash) && hash !== "" && hash !== "#") {
        try {
          const target = document.querySelector(hash);
          if (target) target.scrollIntoView({ behavior: "smooth" });
        } catch {}
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (currentHash === "#3d-builder") return <Builder />;
  if (currentHash === "#preview") return <PreviewPage />;
  if (currentHash === "#features") return <FeaturesPage />;
  if (currentHash === "#presets") return <PresetsPage />;
  if (currentHash === "#blog") return <BlogPage />;
  if (currentHash === "#pricing") return <PricingPage />;
  if (currentHash === "#contact") return <ContactPage />;
  if (currentHash === "#profile") return <ProfilePage />;

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] overflow-x-hidden antialiased selection:bg-blue-500/30 relative" style={{ fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <ShowcaseSection />
        <TemplatesShowcase />
        <PipelineSection />
        <ProToolsSection />
        <AnimatedTestimonials testimonials={testimonialData} />
        <FeaturesHeroSection />
        <Footer />
      </div>
    </div>
  );
}
