"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse, Lightbulb, Clock, ChevronRight,
  Activity, Shield, FileText, RefreshCw
} from "lucide-react";
import Link from "next/link";

interface HealthTip { tip: string; category: string; emoji: string; }
interface TriageHistoryItem {
  id: string; createdAt: string; symptoms: string; intensity: number;
  result: { recommendation_level: string; possible_conditions: string[]; precautions: string[] };
}

export default function PatientDashboard() {
  const [tip, setTip] = useState<HealthTip | null>(null);
  const [tipLoading, setTipLoading] = useState(true);
  const [history, setHistory] = useState<TriageHistoryItem[]>([]);

  useEffect(() => {
    // Load triage history from localStorage
    const stored = JSON.parse(localStorage.getItem("medai-triage-history") || "[]") as TriageHistoryItem[];
    setHistory(stored.slice(0, 5));

    // Fetch AI health tip
    loadTip();
  }, []);

  const loadTip = async () => {
    setTipLoading(true);
    try {
      const res = await fetch("/api/health-tip");
      const data = await res.json() as HealthTip;
      setTip(data);
    } catch {
      setTip({ tip: "Drink a glass of water to start your day right.", category: "Hydration", emoji: "💧" });
    } finally {
      setTipLoading(false);
    }
  };

  const levelColor = (level: string) => {
    if (level === "Urgent Care") return "text-red-400 bg-red-500/10 border-red-500/30";
    if (level === "Consult Doctor") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Your Health Dashboard</h1>
        <p className="text-slate-400 mt-1">Monitor your health and access AI triage anytime.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/triage">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="group cursor-pointer rounded-3xl border border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 p-6 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Start AI Triage</h3>
                  <p className="text-sm text-slate-400">Describe symptoms & get instant analysis</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
            </div>
          </motion.div>
        </Link>
        <Link href="/passport">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="group cursor-pointer rounded-3xl border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 p-6 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Medical Passport</h3>
                  <p className="text-sm text-slate-400">Emergency medical ID with QR code</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Daily Health Tip */}
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-black uppercase tracking-widest text-emerald-300/90">AI Health Tip of the Day</span>
          </div>
          <button onClick={loadTip} disabled={tipLoading}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${tipLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <AnimatePresence mode="wait">
          {tipLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-4/5" />
            </div>
          ) : tip ? (
            <motion.div key={tip.tip} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex gap-3">
                <span className="text-3xl">{tip.emoji}</span>
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{tip.category}</span>
                  <p className="text-slate-200 mt-1 leading-relaxed">{tip.tip}</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Triage History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Recent Triage Sessions</h2>
        </div>
        {history.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
            <HeartPulse className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No triage history yet.</p>
            <p className="text-slate-600 text-sm mt-1">Start your first AI triage session above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{h.symptoms}</p>
                  <p className="text-slate-400 text-xs mt-1">{new Date(h.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  {h.result?.possible_conditions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {h.result.possible_conditions.slice(0, 2).map((c) => (
                        <span key={c} className="text-xs bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-lg">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`text-xs font-black px-3 py-1.5 rounded-xl border whitespace-nowrap ${levelColor(h.result?.recommendation_level || "")}`}>
                  {h.result?.recommendation_level || "—"}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
