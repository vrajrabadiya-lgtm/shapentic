import React from "react";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import "./styles/PricingPage.css";
import logo from "./assets/logo.svg";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <img src={logo} alt="Logo" className="w-12 h-12" />
      <PricingPage />
      <ContactPage />
    </div>
  );
}
