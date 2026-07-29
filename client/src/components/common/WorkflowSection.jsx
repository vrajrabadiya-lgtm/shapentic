import React, { useState } from "react";
import {
  Sparkles, Terminal, Image, Video, Layers, Download,
  Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Workflow
} from "lucide-react";

export default function PipelineSection() {
  const pipelineSteps = [
    { number: "01", title: "Pick a preset", desc: "Start from production-ready UI — customize copy and media in minutes.", icon: Sparkles },
    { number: "02", title: "Describe",      desc: "Tell us the visual atmosphere you want.",           icon: Terminal },
    { number: "03", title: "Generate",      desc: "AI creates a cinematic keyframe.",                  icon: Image },
    { number: "04", title: "Animate",       desc: "The image becomes a smooth 8s video.",              icon: Video },
    { number: "05", title: "Build",         desc: "AI extracts frames for a 3D scroll site.",          icon: Layers },
    { number: "06", title: "Deploy",        desc: "Download a ZIP with HTML, CSS, JS.",               icon: Download },
  ];

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: null, text: "" });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: null, text: "" });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5051"}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to send message.");
      }

      const data = await response.json();
      setFormStatus({
        type: "success",
        text: data.emailSent
          ? `Thanks ${data.name || contactName}! Message saved and email sent.`
          : `Thanks ${data.name || contactName}! Message saved. Email could not be sent — check EMAIL_USER / EMAIL_PASS in server/.env.`,
      });
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      const isNetworkError = err instanceof TypeError || err.message?.toLowerCase().includes("fetch");
      setFormStatus({
        type: "error",
        text: isNetworkError
          ? "Failed to connect to the backend server. Make sure it is running on port 5051."
          : err.message || "Failed to submit message.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="pipeline" className="w-full py-28 px-6 relative select-none">
      {/* Ambient glow */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#0a1833]/30 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">

        {/* Section Header */}
        <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full bg-[#2997ff]/10 border border-[#2997ff]/25 text-[#2997ff] text-[10px] font-bold tracking-[0.18em] uppercase">
          <Workflow className="h-3 w-3" />
          The Pipeline
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[#f5f5f7] mb-5 max-w-4xl">
          From prompt to <span className="text-[#2997ff]">production</span>
        </h2>

        <p className="text-[#86868b] text-sm md:text-base leading-relaxed max-w-2xl mb-16">
          Use a stunning preset and edit in place — or describe a 3D scroll site from scratch. AI generates motion, extracts frames, and ships production HTML without a long prompt.
        </p>

        {/* Pipeline Steps Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-24 relative">
          {/* Connecting track */}
          <div className="absolute top-[42px] left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden lg:block z-0" />

          {pipelineSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="relative z-10 p-5 rounded-2xl border border-white/[0.07] bg-[#141416] flex flex-col items-center text-center transition-all duration-300 hover:border-white/15 hover:bg-[#1c1c1e] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
              >
                {/* Icon Node */}
                <div className="h-11 w-11 rounded-xl bg-[#1c1c1e] border border-white/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="h-4 w-4 text-[#2997ff]" />
                </div>

                <span className="text-[10px] font-bold tracking-widest text-[#3a3a3c] font-mono mb-2 block">
                  {step.number}
                </span>
                <h3 className="text-sm font-bold text-[#f5f5f7] mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-[#86868b] text-[11px] leading-relaxed max-w-[160px]">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Contact Form — Full-width Apple Card */}
        <div
          id="contact"
          className="w-full max-w-4xl text-left border border-white/[0.07] rounded-[2rem] bg-[#141416] p-8 md:p-14 relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.7)]"
        >
          {/* Corner glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#2997ff]/6 rounded-full blur-[80px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">

            {/* Left: Info */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#2997ff] uppercase block mb-3">
                  Have Questions?
                </span>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#f5f5f7] mb-3">
                  Let's Connect
                </h3>
                <p className="text-[#86868b] text-xs leading-relaxed">
                  Have customization inquiries or questions about our WebGL engine? Fill out the form and your query will compile directly into our database feed.
                </p>
              </div>

              <div className="space-y-3 pt-2 text-xs text-[#86868b]">
                {[
                  { Icon: Mail, text: "support@shapentic.space" },
                  { Icon: MessageSquare, text: "24/7 MERN Stack Support Enabled" },
                ].map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#1c1c1e] border border-white/[0.07] flex items-center justify-center text-[#2997ff] shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-7 bg-[#1c1c1e] border border-white/[0.07] rounded-2xl p-6 md:p-8">
              {formStatus.text && (
                <div className={`p-4 mb-5 rounded-xl border flex items-start gap-2.5 text-xs ${
                  formStatus.type === "success"
                    ? "bg-[#30d158]/10 border-[#30d158]/20 text-[#30d158]"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  {formStatus.type === "success"
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  }
                  <span>{formStatus.text}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Your Name", type: "text", value: contactName, onChange: setContactName, placeholder: "Jane Doe" },
                    { label: "Email Address", type: "email", value: contactEmail, onChange: setContactEmail, placeholder: "jane@company.com" },
                  ].map(({ label, type, value, onChange, placeholder }) => (
                    <div key={label} className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#86868b]">
                        {label}
                      </label>
                      <input
                        type={type}
                        required
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-11 px-4 bg-[#242426] border border-white/[0.07] rounded-xl text-xs text-[#f5f5f7] placeholder-[#3a3a3c] outline-none focus:border-[#2997ff]/50 focus:ring-1 focus:ring-[#2997ff]/20 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#86868b]">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe how we can help you configure your 3D workflow..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full p-4 bg-[#242426] border border-white/[0.07] rounded-xl text-xs text-[#f5f5f7] placeholder-[#3a3a3c] outline-none focus:border-[#2997ff]/50 focus:ring-1 focus:ring-[#2997ff]/20 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#2997ff] hover:bg-[#0077ed] disabled:opacity-50 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_14px_rgba(41,151,255,0.3)] cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Sending Submission...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}