import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { CheckCircle, XCircle, Loader2, ChevronLeft, Shield, LogOut } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://shapentic.onrender.com";

const INPUT = "w-full h-11 px-4 bg-[#1c1c1e] border border-white/10 rounded-2xl text-sm text-[#f5f5f7] placeholder-[#3a3a3c] outline-none focus:border-[#2997ff]/60 focus:bg-[#242426] transition-all duration-200";
const LABEL = "text-[11px] font-semibold text-[#86868b] tracking-wide";

function StatusBanner({ status }) {
  if (!status) return null;
  const ok = status.type === "success";
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-medium mb-5 animate-apple-fade-up ${ok ? "bg-[#1a3a2a] border-[#30d158]/30 text-[#30d158]" : "bg-[#3a1a1a] border-[#ff453a]/30 text-[#ff453a]"}`}>
      {ok ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
      {status.text}
    </div>
  );
}

export default function ProfilePage() {
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("auth_user")) || null; } catch { return null; }
  };

  const [user, setUser] = useState(getUser);
  const [tab, setTab] = useState("name");
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [nameStatus, setNameStatus] = useState(null);
  const [passStatus, setPassStatus] = useState(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col" style={{ fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="h-16 w-16 rounded-full bg-[#1c1c1e] border border-white/10 flex items-center justify-center mb-2">
            <Shield className="h-7 w-7 text-[#86868b]" />
          </div>
          <p className="text-[#f5f5f7] font-semibold text-base">Sign in required</p>
          <p className="text-[#86868b] text-sm">You need to be signed in to view your profile.</p>
          <a href="#" className="mt-2 px-5 py-2.5 bg-[#2997ff] text-white text-sm font-semibold rounded-full hover:bg-[#0077ed] transition-all">Back to Home</a>
        </div>
        <Footer />
      </div>
    );
  }

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true); setNameStatus(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API}/api/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update name.");
      const updated = { ...user, name: data.user?.name || name };
      localStorage.setItem("auth_user", JSON.stringify(updated));
      setUser(updated);
      setNameStatus({ type: "success", text: "Name updated successfully." });
    } catch (err) {
      setNameStatus({ type: "error", text: err.message });
    } finally { setNameLoading(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPassStatus({ type: "error", text: "Passwords do not match." }); return; }
    if (newPassword.length < 6) { setPassStatus({ type: "error", text: "Password must be at least 6 characters." }); return; }
    setPassLoading(true); setPassStatus(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API}/api/auth/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password.");
      setPassStatus({ type: "success", text: "Password updated successfully." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPassStatus({ type: "error", text: err.message });
    } finally { setPassLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.hash = "";
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] overflow-x-hidden" style={{ fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-24">

        {/* Back */}
        <button onClick={() => { window.location.href = "/"; }}
          className="flex items-center gap-1 text-[#2997ff] text-sm font-medium mb-6 sm:mb-10 hover:opacity-70 transition-opacity cursor-pointer">
          <ChevronLeft className="h-4 w-4" />
          Home
        </button>

        {/* Landscape two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch lg:items-start w-full">

          {/* LEFT — Profile Card */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-[#161617] rounded-3xl border border-white/[0.08] p-6 flex flex-col items-center text-center animate-apple-fade-up">
              <div className="relative mb-4">
                <div className="h-20 w-20 rounded-full flex items-center justify-center shadow-2xl"
                  style={{ background: "linear-gradient(135deg, #2997ff 0%, #6e40c9 100%)" }}>
                  <span className="text-3xl font-black text-white tracking-tight">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#30d158] border-2 border-[#161617]" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-[#f5f5f7] leading-tight">{user.name}</h1>
              <p className="text-xs text-[#86868b] mt-1 break-all">{user.email}</p>
              <div className="mt-3 px-3 py-1 rounded-full bg-[#1c1c1e] border border-white/10 text-[10px] text-[#86868b] font-medium">
                Shapentic Account
              </div>

              <div className="w-full mt-6 pt-5 border-t border-white/[0.06]">
                <button onClick={handleLogout}
                  className="w-full h-10 bg-transparent hover:bg-[#ff453a]/10 active:scale-[0.98] border border-[#ff453a]/30 text-[#ff453a] font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>

              <p className="text-[10px] text-[#3a3a3c] mt-4">Version 1.0.0</p>
            </div>
          </div>

          {/* RIGHT — Forms */}
          <div className="flex-1 min-w-0 w-full">

            {/* Tab Switcher */}
            <div className="flex w-full bg-[#1c1c1e] rounded-2xl p-1 mb-6 border border-white/[0.06]">
              {[{ id: "name", label: "Display Name" }, { id: "password", label: "Password" }].map((t) => (
                <button key={t.id} onClick={() => { setTab(t.id); setNameStatus(null); setPassStatus(null); }}
                  className={`flex-1 w-1/2 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer text-center ${tab === t.id ? "bg-[#2c2c2e] text-[#f5f5f7] shadow-sm" : "text-[#86868b] hover:text-[#f5f5f7]"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Name Tab */}
            {tab === "name" && (
              <div className="w-full bg-[#161617] rounded-3xl border border-white/[0.08] overflow-hidden">
                <div className="px-6 pt-6 pb-6">
                  <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-5">Display Name</p>
                  <StatusBanner status={nameStatus} />
                  <form onSubmit={handleNameUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <label className={LABEL}>Full Name</label>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Your name" className={INPUT} />
                    </div>
                    <button type="submit" disabled={nameLoading}
                      className="w-full h-11 bg-[#2997ff] hover:bg-[#0077ed] active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-lg shadow-[#2997ff]/20">
                      {nameLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {nameLoading ? "Saving…" : "Save Changes"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {tab === "password" && (
              <div className="w-full bg-[#161617] rounded-3xl border border-white/[0.08] overflow-hidden">
                <div className="px-6 pt-6 pb-6">
                  <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-5">Change Password</p>
                  <StatusBanner status={passStatus} />
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    {[
                      { label: "Current Password", value: currentPassword, set: setCurrentPassword, placeholder: "••••••••" },
                      { label: "New Password", value: newPassword, set: setNewPassword, placeholder: "Min. 6 characters" },
                      { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, placeholder: "Repeat new password" },
                    ].map((field) => (
                      <div key={field.label} className="space-y-2">
                        <label className={LABEL}>{field.label}</label>
                        <input type="password" required minLength={6} placeholder={field.placeholder}
                          value={field.value} onChange={(e) => field.set(e.target.value)} className={INPUT} />
                      </div>
                    ))}
                    <button type="submit" disabled={passLoading}
                      className="w-full h-11 bg-[#2997ff] hover:bg-[#0077ed] active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-lg shadow-[#2997ff]/20">
                      {passLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {passLoading ? "Updating…" : "Update Password"}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
