import React from "react";
import FeaturesHeroSection from "../components/common/FeaturesHeroSection";
import ProToolsSection from "../components/common/ProTool";
import ServicesSection from "../components/common/ServicesSection";
import WhyChooseUsBento from "../components/common/WhyChooseUsBento";
import StatsSection from "../components/common/StatsSection";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans overflow-x-hidden">
      <Navbar />
      <div className="pt-24">
        <FeaturesHeroSection />
        <ProToolsSection />
        <ServicesSection />
        <WhyChooseUsBento />
        <StatsSection />
      </div>
      <Footer />
    </div>
  );
}
