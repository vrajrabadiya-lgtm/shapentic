import React, { useState, useEffect } from "react";
import Navbar from "./components/common/Navbar";
import HeroSection from "./components/common/HeroSection";
import TrustMarquee from "./components/common/TrustMarquee";
import ServicesSection from "./components/common/ServicesSection";
import WhyChooseUsBento from "./components/common/WhyChooseUsBento";
import ProcessTimeline from "./components/common/ProcessTimeline";
import ShowcaseSection from "./components/common/ShowcaseSection";
import StatsSection from "./components/common/StatsSection";
import TestimonialsSection from "./components/common/TestimonialsSection";
import PricingSection from "./components/common/Pricing";
import FaqAccordion from "./components/common/FaqAccordion";
import FinalCtaBanner from "./components/common/FinalCtaBanner";
import WorkflowSection from "./components/common/WorkflowSection";
import Footer from "./components/common/Footer";
import ScrollReveal from "./components/common/ScrollReveal";
import Builder from "./components/common/Builder";

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#");

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || "#");
      const hash = window.location.hash;
      if (hash && hash !== "#3d-builder") {
        const target = document.querySelector(hash);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    if (window.location.hash && window.location.hash !== "#3d-builder") {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (currentHash === "#3d-builder") return <Builder />;

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] overflow-x-hidden antialiased selection:bg-[#2997ff]/20 select-none" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>

      <Navbar />

      <div id="home">
        <HeroSection />
      </div>

      <main>
        <TrustMarquee />

        <ScrollReveal><ServicesSection /></ScrollReveal>
        <ScrollReveal><WhyChooseUsBento /></ScrollReveal>
        <ScrollReveal><ProcessTimeline /></ScrollReveal>
        <ScrollReveal><ShowcaseSection /></ScrollReveal>
        <ScrollReveal><StatsSection /></ScrollReveal>
        <ScrollReveal><TestimonialsSection /></ScrollReveal>

        <div id="pricing">
          <ScrollReveal><PricingSection /></ScrollReveal>
        </div>

        <ScrollReveal><FaqAccordion /></ScrollReveal>
        <ScrollReveal><FinalCtaBanner /></ScrollReveal>

        <div id="contact">
          <ScrollReveal><WorkflowSection /></ScrollReveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
