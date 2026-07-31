import React from "react";
import PricingSection from "../components/common/Pricing";
import FinalCtaBanner from "../components/common/FinalCtaBanner";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans overflow-x-hidden">
      <Navbar />
      <div className="pt-24">
        <PricingSection />
        <FinalCtaBanner />
      </div>
      <Footer />
    </div>
  );
}
