import React from "react";
import TrustMarquee from "../components/common/TrustMarquee";
import PipelineSection from "../components/common/PipelineSection";
import ProcessTimeline from "../components/common/ProcessTimeline";
import CompareMatrix from "../components/common/CompareMatrix";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans overflow-x-hidden">
      <Navbar />
      <div className="pt-24">
        {/* <TrustMarquee /> */}
        <PipelineSection />
        <ProcessTimeline />
        {/* <CompareMatrix /> */}
      </div>
      <Footer />
    </div>
  );
}
