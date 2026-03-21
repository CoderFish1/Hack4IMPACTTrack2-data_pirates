"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import {
  HeartPulse, Activity, Shield, Users, Brain, FileText, ArrowRight,
  Sun, Moon, Star, Zap, Lock, Globe, AlertCircle, MessageSquare,
  X, Send, Loader2
} from "lucide-react";
import SplashScreen from "@/components/splash-screen";
import FloatingChatWidget from "@/components/floating-chat-widget";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if splash was already shown
    if (sessionStorage.getItem("splash_shown") === "1") {
      setSplashDone(true);
    }
  }, []);

  const features = [
    {
      icon: <Brain className="h-6 w-6 text-emerald-500" />,
      title: "Multi-Agent AI Triage",
      desc: "Instant consensus from specialized AI models (Cardiology, Neurology, General) to formulate accurate preliminary assessments.",
    },
    {
      icon: <Shield className="h-6 w-6 text-sky-500" />,
      title: "Med-Safe Profiling",
      desc: "Real-time algorithmic checks for drug interactions and contraindications, ensuring patient safety before any medication is prescribed.",
    },
    {
      icon: <FileText className="h-6 w-6 text-violet-500" />,
      title: "Instant SBAR Export",
      desc: "One-click generation of standard clinical handover reports, bridging the gap between digital triage and real-world ER workflows.",
    },
    {
      icon: <Lock className="h-6 w-6 text-amber-500" />,
      title: "Privacy First",
      desc: "Military-grade encryption and local secure enclaves keep patient data safe. HIPAA compliant out of the box.",
    },
  ];

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}

      <motion.div
        className="min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-500 dark:selection:text-emerald-200 overflow-x-hidden bg-slate-50 dark:bg-[#080d14]"
        initial={{ opacity: 0 }}
        animate={{ opacity: splashDone ? 1 : 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
      
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <motion.div 
              animate={{ y: [-3, 3, -3] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#0ea5e9] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <HeartPulse className="h-6 w-6 text-white" />
            </motion.div>
            <span className="font-black tracking-tight text-xl leading-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 drop-shadow-[0_0_8px_rgba(20,184,166,0.3)] dark:drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]">संजीवनी</span>
              <span className="text-slate-900 dark:text-white ml-1">Lifeline</span>
            </span>
          </Link>

          {/* Expanded Navbar Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-slate-600 hover:text-emerald-600 dark:text-white/70 dark:hover:text-white transition-colors">Features</Link>
            <Link href="#about" className="text-sm font-bold text-slate-600 hover:text-emerald-600 dark:text-white/70 dark:hover:text-white transition-colors">About</Link>
            <Link href="#contact" className="text-sm font-bold text-slate-600 hover:text-emerald-600 dark:text-white/70 dark:hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hidden sm:block"
            >
              {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-emerald-600 dark:text-white/70 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard/patient">
              <button className="group relative hidden sm:flex items-center justify-center gap-2 rounded-xl bg-black/5 dark:bg-white/10 px-5 py-2.5 text-sm font-bold text-slate-900 dark:text-white transition-all hover:bg-black/10 dark:hover:bg-white/20 hover:scale-105 active:scale-95 border border-black/5 dark:border-white/10 overflow-hidden">
                <span className="relative z-10">Dashboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 dark:from-emerald-500/20 dark:to-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── CONSTANT MARQUEE TICKER ── */}
      <div className="mt-20 border-b border-black/5 dark:border-white/5 bg-emerald-500/5 dark:bg-emerald-500/10 py-2 overflow-hidden flex whitespace-nowrap">
        <motion.div 
           className="flex gap-12 items-center"
           animate={{ x: [0, -1000] }} 
           transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-12 items-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> LIVE EPIDEMIC RADAR ACTIVE</span>
              <span className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> MULTI-AGENT TRIAGE</span>
              <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> HIPAA COMPLIANT DATA</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> 100+ SUCCESSFUL CLINICAL DEPLOYMENTS</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 px-6 overflow-hidden">
        
        {/* DNA Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            src="/dna.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="dna-bg w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"
            style={{ filter: "hue-rotate(140deg) contrast(1.4) saturate(1.8)" }}
          />
          {/* Gradient overlay to fade the video seamlessly into the background */}
          <div className="dna-video-overlay absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/40 to-slate-50 dark:from-black/80 dark:via-black/40 dark:to-[#080d14]" />
        </div>

        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 dark:border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 px-4 py-1.5 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">MedAI Engine v2.0 Live</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.3] pb-2 mb-4">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.3)] dark:drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                संजीवनी
              </span>
              <span className="block mt-2">Lifeline</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12"
          >
            Enterprise clinical AI that bridges patient self-triage with hospital administration. Experience next-generation emergency health routing.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full relative group inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 dark:bg-white px-8 py-4 text-base font-black text-white dark:text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Enter The Application
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/dashboard/patient" className="w-full sm:w-auto">
              <button className="w-full relative group inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 px-8 py-4 text-base font-black text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-500/20 hover:scale-105 active:scale-95">
                View AI Health Tools
              </button>
            </Link>
            <div className="flex items-center gap-4 mt-4 sm:mt-0 text-slate-500 text-sm font-bold">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-[#080d14] flex items-center justify-center bg-slate-100 dark:bg-slate-800`}>
                    <Star className="w-4 h-4 text-emerald-500" />
                  </div>
                ))}
              </div>
              <p>Trusted by <span className="text-slate-900 dark:text-white">100+</span> clinics</p>
            </div>
          </motion.div>
        </div>

        {/* Hero Image / Dashboard Preview */}
        <motion.div
           initial={{ opacity: 0, y: 40 }} 
           animate={{ opacity: 1, y: 0 }} 
           transition={{ duration: 0.7, delay: 0.5 }}
           className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent dark:from-[#080d14] z-10" />
          <div className="relative rounded-3xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl p-2 md:p-4 shadow-2xl overflow-hidden">
            <div className="w-full h-8 bg-black/5 dark:bg-black/40 rounded-t-2xl flex items-center px-4 gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            {/* Fake dashboard UI inside the mockup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
              <div className="col-span-2 bg-black/5 dark:bg-black/40 rounded-2xl p-6 border border-black/5 dark:border-white/5 relative overflow-hidden">
                <div className="w-3/4 h-6 border-b border-black/10 dark:border-white/10 mb-6" />
                <div className="space-y-4">
                  <div className="w-full h-12 bg-black/5 dark:bg-white/5 rounded-xl animate-pulse" />
                  <div className="w-5/6 h-12 bg-black/5 dark:bg-white/5 rounded-xl animate-pulse delay-75" />
                  <div className="w-4/6 h-12 bg-black/5 dark:bg-white/5 rounded-xl animate-pulse delay-150" />
                </div>
                {/* Decorative glowing orb inside the mockup */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/20 blur-[80px]" />
              </div>
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/10 dark:border-emerald-500/20 relative flex flex-col items-center justify-center text-center">
                <HeartPulse className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">System Optimal</h3>
                <p className="text-emerald-600 dark:text-emerald-400/80 text-sm mt-2 font-medium">Processing 200+ inputs/sec</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="py-24 px-6 relative z-10 bg-black/5 dark:bg-black/20 border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Built for Modern Medicine</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              We've replaced outdated, clunky legacy systems with a lightning-fast, ultra-secure architecture powered by the latest advancements in LLMs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-white/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] border border-black/5 dark:border-white/5 hover:border-emerald-500/20 dark:hover:border-emerald-500/30 transition-all cursor-crosshair overflow-hidden relative shadow-sm hover:shadow-md dark:shadow-none"
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                  {f.icon}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10 shadow-inner mb-6 group-hover:scale-110 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-all">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / STATS ── */}
      <section id="about" className="py-24 px-6 relative z-10 border-t border-black/5 dark:border-white/5 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#080d14] dark:to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             {[
               { val: "99.9%", label: "Uptime SLA", icon: <Globe className="w-5 h-5" /> },
               { val: "< 1s", label: "Analysis Time", icon: <Zap className="w-5 h-5" /> },
               { val: "3 Agents", label: "Specialist Consensus", icon: <Users className="w-5 h-5" /> },
               { val: "O-Auth", label: "Secure Integration", icon: <Shield className="w-5 h-5" /> },
             ].map((stat, i) => (
                <div key={i} className="text-center flex flex-col items-center">
                  <div className="mb-4 text-emerald-600 dark:text-emerald-400 opacity-80">{stat.icon}</div>
                  <h4 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{stat.val}</h4>
                  <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <footer id="contact" className="py-24 px-6 relative z-10 border-t border-black/5 dark:border-white/5 text-center overflow-hidden bg-white dark:bg-transparent">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <HeartPulse className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">Ready to upgrade your triage?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">Stop relying on outdated workflows. Start leveraging Multi-Agent AI today to redefine patient care.</p>
          <Link href="/login">
            <button className="bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-black text-lg px-10 py-5 rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] dark:hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              Enter The Application
            </button>
          </Link>
        </div>
        <div className="mt-20 text-slate-500 dark:text-slate-600 text-sm font-semibold">
          © {new Date().getFullYear()} संजीवनी Lifeline • MedAI Tech • All rights reserved.
        </div>
      </footer>
    </motion.div>
    <FloatingChatWidget />
    </>
  );
}