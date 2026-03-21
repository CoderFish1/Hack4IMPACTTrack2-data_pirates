"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, AlertTriangle, CheckCircle, HelpCircle,
  ArrowLeft, Loader2, ShieldAlert, ShieldCheck, Shield,
  Send, Flame
} from "lucide-react";
import Link from "next/link";

interface MythResult {
  status: "FAKE" | "TRUE" | "NEEDS CONTEXT";
  explanation: string;
  dangerLevel: "High" | "Medium" | "Low";
  sources: string;
}

const statusConfig = {
  FAKE: {
    bg: "bg-red-500/10", border: "border-red-500/40", text: "text-red-400",
    icon: <AlertTriangle className="h-10 w-10" />,
    label: "FAKE — Misinformation Detected",
    glow: "shadow-[0_0_60px_rgba(239,68,68,0.3)]",
    gradient: "from-red-500/20 to-transparent",
  },
  TRUE: {
    bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-400",
    icon: <CheckCircle className="h-10 w-10" />,
    label: "TRUE — Verified Information",
    glow: "shadow-[0_0_60px_rgba(16,185,129,0.3)]",
    gradient: "from-emerald-500/20 to-transparent",
  },
  "NEEDS CONTEXT": {
    bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-400",
    icon: <HelpCircle className="h-10 w-10" />,
    label: "NEEDS CONTEXT — Partially True",
    glow: "shadow-[0_0_60px_rgba(245,158,11,0.3)]",
    gradient: "from-amber-500/20 to-transparent",
  },
};

const dangerConfig = {
  High: { color: "text-red-400 bg-red-500/10 border-red-500/30", icon: <Flame className="h-3.5 w-3.5" /> },
  Medium: { color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
  Low: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
};

export default function MythBusterPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MythResult | null>(null);
  const [error, setError] = useState("");

  const check = async () => {
    if (!message.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/myth-buster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forwardedMessage: message }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("Fact-check failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patient"
          className="p-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
          <ArrowLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">WhatsApp Myth Buster</h1>
          <p className="text-slate-400 text-sm mt-0.5">Paste a health claim from WhatsApp. AI instantly fact-checks it.</p>
        </div>
      </div>

      {/* Input Area — "Message Inspector" */}
      <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-8 space-y-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-violet-400" />
          <span className="text-sm font-black uppercase tracking-widest text-violet-300/90">Message Inspector</span>
        </div>

        {/* Chat-like textarea */}
        <div className="relative">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-1">
            <div className="flex items-start gap-3 p-3 pb-1">
              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                <MessageCircle className="h-4 w-4 text-green-400" />
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder='Paste the WhatsApp forward here... e.g. "Drinking hot water with lemon cures cancer" or "Eating garlic kills COVID instantly"'
                rows={5}
                className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder:text-slate-600 leading-relaxed"
              />
            </div>
            <div className="flex justify-end p-3 pt-1">
              <button onClick={check} disabled={loading || !message.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-black text-sm disabled:opacity-40 transition-all shadow-lg shadow-violet-500/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? "Checking..." : "Fact-Check"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs font-medium flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> {error}
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-10 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
          <p className="text-slate-300 font-bold">Cross-referencing medical databases...</p>
          <p className="text-slate-500 text-xs">Analyzing claim against verified sources</p>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            {/* Giant Verdict Banner */}
            <div className={`rounded-3xl border-2 ${statusConfig[result.status].border} ${statusConfig[result.status].bg} ${statusConfig[result.status].glow} p-8 relative overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-b ${statusConfig[result.status].gradient}`} />
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className={statusConfig[result.status].text}>
                  {statusConfig[result.status].icon}
                </div>
                <div>
                  <p className={`text-3xl font-black ${statusConfig[result.status].text}`}>
                    {result.status}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">{statusConfig[result.status].label}</p>
                </div>

                {/* Danger Level Badge */}
                <div className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl border ${dangerConfig[result.dangerLevel].color}`}>
                  {dangerConfig[result.dangerLevel].icon}
                  Danger Level: {result.dangerLevel}
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Explanation</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{result.explanation}</p>
            </div>

            {/* Sources */}
            {result.sources && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-sky-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-300">Medical Evidence</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{result.sources}</p>
              </div>
            )}

            {/* Try another */}
            <div className="flex justify-center">
              <button onClick={() => { setResult(null); setMessage(""); }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:border-violet-500/30 font-bold text-sm transition-all">
                <MessageCircle className="h-4 w-4" /> Check Another Message
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
