import React from "react";
import ContactSection from "../components/common/ContactSection";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans overflow-x-hidden">
      <Navbar />
      <div className="pt-24">
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}
