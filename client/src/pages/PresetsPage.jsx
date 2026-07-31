import React from "react";
import TemplatesShowcase from "../components/common/Template";
import PresetsSection from "../components/common/PresetsSection";
import ShowcaseSection from "../components/common/ShowcaseSection";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function PresetsPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans overflow-x-hidden">
      <Navbar />
      <div className="pt-24">
        <TemplatesShowcase />
        <PresetsSection />
        <ShowcaseSection />
      </div>
      <Footer />
    </div>
  );
}
