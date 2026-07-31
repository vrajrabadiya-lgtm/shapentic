import React, { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactSection() {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://shapentic.onrender.com"}/api/contact`, {
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
      setContactName(""); setContactEmail(""); setContactMessage("");
    } catch (err) {
      const isNetworkError = err instanceof TypeError || err.message?.toLowerCase().includes("fetch");
      setFormStatus({
        type: "error",
        text: isNetworkError
          ? "Failed to connect to the backend server."
          : err.message || "Failed to submit message.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="w-full text-[#f5f5f7] py-24 px-6 border-t border-white/10 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="w-full text-left border border-white/10 rounded-[2.5rem] bg-[#161617] p-8 md:p-14 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left: Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#2997ff] uppercase block mb-2">Have Questions?</span>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#f5f5f7] mb-3">Let's Connect</h3>
                <p className="text-xs text-[#86868b] leading-relaxed font-normal">
                  Have customization inquiries or questions about our WebGL engine? Fill out the form, and your query will compile directly into our database feed.
                </p>
              </div>
              <div className="space-y-4 pt-4 text-xs text-[#86868b] font-normal">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#2c2c2e] border border-white/10 flex items-center justify-center text-[#2997ff]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>support@Shapentic.space</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#2c2c2e] border border-white/10 flex items-center justify-center text-[#2997ff]">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span>24/7 MERN Stack Support Enabled</span>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-7 bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 md:p-8">
              {formStatus.text && (
                <div className={`p-4 mb-6 rounded-xl border flex items-start gap-2.5 text-xs ${formStatus.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border-red-500/20 text-red-300"}`}>
                  {formStatus.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                  <span>{formStatus.text}</span>
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">Your Name</label>
                    <input type="text" required placeholder="Jane Doe" value={contactName} onChange={(e) => setContactName(e.target.value)}
                      className="w-full h-10 px-3 bg-[#2c2c2e] border border-white/10 rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] outline-none focus:border-[#2997ff] transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">Email Address</label>
                    <input type="email" required placeholder="jane@company.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full h-10 px-3 bg-[#2c2c2e] border border-white/10 rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] outline-none focus:border-[#2997ff] transition-colors" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">Your Message</label>
                  <textarea required rows={4} placeholder="Describe how we can help you configure your 3D workflow..." value={contactMessage} onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full p-3 bg-[#2c2c2e] border border-white/10 rounded-xl text-xs text-[#f5f5f7] placeholder-[#86868b] outline-none focus:border-[#2997ff] transition-colors resize-none" />
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full h-11 bg-[#2997ff] hover:bg-[#0077ed] disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-[#2997ff]/20">
                  {isSubmitting ? <span>Sending...</span> : <><Send className="h-3.5 w-3.5" /><span>Send Message</span></>}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
