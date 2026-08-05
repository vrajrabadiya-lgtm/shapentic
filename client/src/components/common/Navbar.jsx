import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { LogOut, CheckCircle, XCircle, Loader2, User, Menu, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://shapentic.onrender.com";

// ─── Toast Notification Component ────────────────────────────────────────────
function Toast({ toasts }) {
  return createPortal(
    <div
      style={{ position: "fixed", top: "24px", right: "16px", zIndex: 99999 }}
      className="flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-medium shadow-2xl backdrop-blur-md pointer-events-auto
            ${t.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/90 border-red-500/40 text-red-300"
            }`}
          style={{ minWidth: "220px", maxWidth: "320px" }}
        >
          {t.type === "success"
            ? <CheckCircle className="h-4 w-4 shrink-0" />
            : <XCircle className="h-4 w-4 shrink-0" />
          }
          <span>{t.message}</span>
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─── Main Navbar ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const navItems = [
    { name: "3D Builder", href: "#3d-builder" },
    { name: "Features", href: "#features" },
    { name: "Presets", href: "#presets" },
    { name: "Blog", href: "#blog" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  const [activeTab, setActiveTab] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // ── Persisted auth state ──
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("auth_user")) || null; }
    catch { return null; }
  });

  // ── Toast helper ──
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // ── Hash tracking ──
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash || "#";
      const matched = navItems.find((i) => i.href === hash);
      setActiveTab(matched ? matched.name : "");
    };
    window.addEventListener("hashchange", sync);
    sync();
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // ── Verify stored token on mount ──
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token || user) return;
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(({ user: u }) => {
        setUser(u);
        localStorage.setItem("auth_user", JSON.stringify(u));
      })
      .catch((err) => {
        // Only clear auth if it's a 401/403 error, not a network error
        if (err instanceof TypeError && err.message.includes("fetch")) {
          console.log("Backend not available - keeping local auth state");
          return;
        }
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setUser(null);
      });
  }, []);

  // ── Google Sign-In ──
  const handleGoogleSignIn = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      let data;
      try { data = await res.json(); } catch { addToast("Unexpected server response.", "error"); return; }
      if (!res.ok) { addToast(data.message || "Google sign-in failed.", "error"); return; }
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      setUser(data.user);
      setIsModalOpen(false);
      addToast(`Welcome, ${data.user.name}! 👋`, "success");
    } catch {
      addToast("Google sign-in failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Init Google One Tap ──
  useEffect(() => {
    if (!isModalOpen) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleSignIn,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("google-signin-btn"),
      { theme: "filled_black", size: "large", width: "100%", text: "continue_with" }
    );
  }, [isModalOpen]);

  // ── Submit handler ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body = authMode === "login"
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        addToast("Server returned an unexpected response.", "error");
        return;
      }

      if (!res.ok) {
        addToast(data.message || "Something went wrong.", "error");
        return;
      }

      // Save token + user
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      setUser(data.user);
      setIsModalOpen(false);
      setEmail(""); setPassword(""); setName("");

      addToast(
        authMode === "login"
          ? `Welcome back, ${data.user.name}! 👋`
          : `Account created! Welcome, ${data.user.name}! 🎉`,
        "success"
      );
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        addToast("Cannot reach server. Check your connection.", "error");
      } else {
        addToast("Something went wrong. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    addToast("Signed out successfully.", "success");
  };

  const switchMode = () => {
    setAuthMode((m) => (m === "login" ? "signup" : "login"));
    setName(""); setEmail(""); setPassword("");
  };

  return (
    <>
      <Toast toasts={toasts} />

      <div className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 w-full pointer-events-none min-h-[80px]">
        {/* Container with pointer-events-auto for children */}
        <nav className="pointer-events-auto flex items-center justify-between w-full max-w-5xl md:max-w-fit px-4 py-3 md:py-2 rounded-full border border-white/10 bg-zinc-950/85 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]">

          {/* Logo */}
          <div className="flex items-center gap-2.5 pr-2 md:pr-4 md:border-r border-white/10 cursor-pointer" onClick={() => { window.location.hash = ""; window.location.href = "/"; }}>
            <img src="/logo.svg" alt="Shapentic Logo" className="h-7 w-7 object-contain" />
            <span className="font-black text-xs tracking-widest text-white uppercase font-sans">
              Shapentic
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.name;
              const isPresets = item.name === "Presets";
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveTab(item.name)}
                  className={`relative px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
                    isPresets
                      ? "text-[#2997ff] bg-[#2997ff]/10 border border-[#2997ff]/30 hover:bg-[#2997ff]/20"
                      : isActive
                      ? "text-white bg-zinc-800/80 border border-white/10 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </a>
              );
            })}
          </div>

          <div className="h-4 w-px bg-white/10 hidden md:block" />

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <button
                onClick={handleLogout}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}

            {/* Avatar / login trigger */}
            <div
              onClick={() => user ? (window.location.hash = "#profile") : setIsModalOpen(true)}
              className={`h-7 w-7 rounded-full border overflow-hidden bg-zinc-800 transition-all cursor-pointer ${user
                ? "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] hover:opacity-80"
                : "border-white/20 hover:opacity-80"
                }`}
              title={user ? `View Profile` : "Sign In"}
            >
              {user ? (
                <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* User name pill */}
            {user && (
              <span className="text-[10px] text-emerald-400 font-semibold hidden md:block max-w-[80px] truncate">
                {user.name}
              </span>
            )}
          </div>

          {/* Mobile Right Controls: Avatar + Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <div
              onClick={() => user ? (window.location.hash = "#profile") : setIsModalOpen(true)}
              className={`h-7 w-7 rounded-full border overflow-hidden bg-zinc-800 transition-all cursor-pointer ${user
                ? "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : "border-white/20"
                }`}
              title={user ? `View Profile` : "Sign In"}
            >
              {user ? (
                <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-zinc-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto fixed top-[80px] left-4 right-4 z-40 bg-zinc-950/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl md:hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.name;
                const isPresets = item.name === "Presets";
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      setActiveTab(item.name);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isPresets
                        ? "text-[#2997ff] bg-[#2997ff]/10 border border-[#2997ff]/30"
                        : isActive
                        ? "text-white bg-zinc-800/90 border border-white/10"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.name}
                  </a>
                );
              })}

              <div className="h-px bg-white/10 my-1" />

              {/* User Account / Profile action inside mobile drawer */}
              {user ? (
                <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-zinc-900/60 border border-white/5">
                  <div
                    onClick={() => {
                      window.location.hash = "#profile";
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{user.name}</span>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-semibold p-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
                >
                  Sign In / Create Account
                </button>
              )}
            </div>
          </div>
        )}
      </div>

        {/* ── Auth Modal ───────────────────────────────────────────────────── */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-md"
            onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
          >
            <div className="relative w-full max-w-sm p-8 bg-zinc-950/95 border border-white/10 rounded-3xl shadow-2xl mx-4 animate-in zoom-in-95 duration-200">

              {/* Close */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 bg-zinc-900/50 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <span className="text-xs font-bold font-mono">✕</span>
              </button>

              {/* Icon */}
              <div className="mb-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-zinc-300" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {authMode === "login" ? "Welcome back" : "Create account"}
                  </h2>
                  <p className="text-[10px] text-zinc-500">
                    {authMode === "login"
                      ? "Sign in to your 3D studio"
                      : "Join Shapentic 3D Studio"}
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {authMode === "signup" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-1"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {loading
                    ? "Please wait..."
                    : authMode === "login" ? "Sign In" : "Create Account"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] text-zinc-600 font-medium">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Google Sign-In */}
                <div id="google-signin-btn" className="w-full flex justify-center" />
              </form>

              {/* Switch mode */}
              <p className="mt-4 text-[11px] text-center text-zinc-500">
                {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={switchMode}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  {authMode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        )}
    </>
  );
}
