"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { HeartPulse, Shield, Brain, Activity } from "lucide-react";

/* ── Phase Config ── */
const PHASE_DURATION = [3200, 3500, 2800]; // ms for each phase
const TOTAL_DURATION = PHASE_DURATION.reduce((a, b) => a + b, 0);

function Particles({ count = 30, color = "emerald" }: { count?: number; color?: string }) {
  const [dots, setDots] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    setDots(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 3,
        duration: Math.random() * 4 + 4,
      }))
    );
  }, [count]);

  if (dots.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className={`absolute rounded-full ${color === "emerald" ? "bg-emerald-400/40" : color === "sky" ? "bg-sky-400/40" : "bg-amber-400/40"}`}
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── Pulse Ring ── */
function PulseRing({ delay = 0, size = 200 }: { delay?: number; size?: number }) {
  return (
    <motion.div
      className="absolute rounded-full border border-emerald-400/30"
      style={{ width: size, height: size }}
      initial={{ scale: 0.3, opacity: 0.8 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 3, delay, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

/* ── PHASE 1: Video Cinematic ── */
function Phase1() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Background Video */}
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 3.5, ease: "easeOut" }}
      >
        <source src="/Video_sdis.mp4" type="video/mp4" />
      </motion.video>

      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Floating particles */}
      <Particles count={25} color="emerald" />

      {/* Main text */}
      <div className="relative z-10 text-center px-6">
        <motion.div
          className="flex items-center justify-center gap-4 mb-6"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <div className="relative">
            <motion.div
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.5)]"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <HeartPulse className="w-10 h-10 text-white" />
            </motion.div>
            <PulseRing delay={0} size={80} />
            <PulseRing delay={1} size={80} />
          </div>
        </motion.div>

        <motion.h1
          className="text-7xl md:text-9xl font-black tracking-tight"
          initial={{ opacity: 0, y: 40, letterSpacing: "-0.3em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.02em" }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_0_30px_rgba(20,184,166,0.6)]">
            संजीवनी
          </span>
        </motion.h1>

        <motion.p
          className="text-2xl md:text-3xl font-bold text-white/90 tracking-widest mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          LIFELINE
        </motion.p>

        {/* Loading bar */}
        <motion.div
          className="mt-10 mx-auto w-48 h-1 rounded-full bg-white/10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── PHASE 2: Feature Showcase ── */
const FEATURES = [
  { icon: Brain, label: "Multi-Agent AI Triage", color: "from-emerald-500 to-teal-500" },
  { icon: Shield, label: "Med-Safe Profiling", color: "from-sky-500 to-indigo-500" },
  { icon: Activity, label: "Real-Time Vitals", color: "from-violet-500 to-purple-500" },
  { icon: HeartPulse, label: "Clinical Intelligence", color: "from-rose-500 to-pink-500" },
];

function Phase2() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />

      <Particles count={20} color="sky" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <motion.p
          className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400/80 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Powered By
        </motion.p>

        <motion.h2
          className="text-4xl md:text-6xl font-black text-white mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Next-Gen{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Clinical AI
          </span>
        </motion.h2>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 md:p-6 overflow-hidden"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.15, ease: "easeOut" }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <motion.div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3 shadow-lg mx-auto`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
              >
                <f.icon className="w-6 h-6 text-white" />
              </motion.div>
              <p className="text-sm md:text-base font-bold text-white/90 text-center">{f.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Scanning line effect */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 2.5, delay: 0.5, ease: "linear", repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

/* ── PHASE 3: Launch ── */
function Phase3() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Central mega-glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-emerald-500/25 blur-[150px]"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <Particles count={40} color="emerald" />

      <div className="relative z-10 text-center px-6">
        {/* Heartbeat icon with rings */}
        <motion.div
          className="flex items-center justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        >
          <div className="relative flex items-center justify-center">
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.6)]"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <HeartPulse className="w-12 h-12 text-white" />
            </motion.div>
            <PulseRing delay={0} size={96} />
            <PulseRing delay={0.5} size={96} />
            <PulseRing delay={1} size={96} />
          </div>
        </motion.div>

        {/* "System Online" */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2 mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.span
            className="w-2.5 h-2.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            System Online
          </span>
        </motion.div>

        <motion.h2
          className="text-5xl md:text-7xl font-black text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Ready to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Save Lives
          </span>
        </motion.h2>

        <motion.p
          className="text-lg text-slate-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Initializing secure clinical environment...
        </motion.p>

        {/* Final loading bar */}
        <motion.div
          className="mt-8 mx-auto w-64 h-1.5 rounded-full bg-white/10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   MAIN SPLASH SCREEN COMPONENT
   ══════════════════════════════════════ */
export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0); // 0, 1, 2 = three screens
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check if splash was already shown this session
    if (sessionStorage.getItem("splash_shown") === "1") {
      setVisible(false);
      onComplete();
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    let elapsed = 0;

    // Schedule phase transitions
    for (let i = 0; i < PHASE_DURATION.length - 1; i++) {
      elapsed += PHASE_DURATION[i];
      const nextPhase = i + 1;
      timers.push(setTimeout(() => setPhase(nextPhase), elapsed));
    }

    // Final: hide splash
    timers.push(
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("splash_shown", "1");
        setTimeout(onComplete, 800); // let exit anim play
      }, TOTAL_DURATION)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (!visible && phase >= PHASE_DURATION.length - 1) {
    return (
      <motion.div
        className="fixed inset-0 z-[9999] bg-black pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    );
  }

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <AnimatePresence mode="wait">
        {phase === 0 && <Phase1 key="p1" />}
        {phase === 1 && <Phase2 key="p2" />}
        {phase === 2 && <Phase3 key="p3" />}
      </AnimatePresence>
    </motion.div>
  );
}
