"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill, Search, ArrowLeft, TrendingDown, Store, ShieldCheck,
  Loader2, AlertCircle, BadgePercent, IndianRupee
} from "lucide-react";
import Link from "next/link";

interface MedicineResult {
  brandedName: string;
  saltName: string;
  strength: string;
  brandedPrice: string;
  genericPrice: string;
  savingsPercent: number;
  janAushadhiAvailable: boolean;
  alternatives: { name: string; price: string; manufacturer: string }[];
  source: string;
  disclaimer: string;
}

export default function MedicineFinderPage() {
  const [drug, setDrug] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedicineResult | null>(null);
  const [error, setError] = useState("");

  const search = async () => {
    if (!drug.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/medicine-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandedName: drug }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Failed to fetch medicine data. Please try again.");
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
          <h1 className="text-2xl font-black text-white">Jan Aushadhi Medicine Finder</h1>
          <p className="text-slate-400 text-sm mt-0.5">Find affordable generic alternatives — save up to 90%</p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-8">
        <div className="flex items-center gap-3 mb-4">
          <Pill className="h-6 w-6 text-emerald-400" />
          <span className="text-sm font-black uppercase tracking-widest text-emerald-300/90">Search Branded Medicine</span>
        </div>
        <p className="text-slate-400 text-xs mb-5">Enter the branded medicine name from your prescription to find its generic Jan Aushadhi equivalent with live pricing.</p>
        <div className="flex gap-3">
          <input value={drug} onChange={e => setDrug(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="e.g. Dolo 650, Crocin, Augmentin, Calpol..."
            className="flex-1 bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-600" />
          <button onClick={search} disabled={loading}
            className="px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Searching..." : "Find Generic"}
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-3 font-medium flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}
      </div>

      {/* Loading Skeleton */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8">
              <div className="space-y-3">
                <div className="h-6 bg-white/5 rounded-xl animate-pulse w-1/3" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-2/3" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="h-28 bg-white/5 rounded-2xl animate-pulse" />
                  <div className="h-28 bg-white/5 rounded-2xl animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Salt & Strength */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Pill className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold">{result.saltName}</p>
                <p className="text-slate-500 text-xs">{result.strength} • {result.brandedName}</p>
              </div>
              {result.janAushadhiAvailable && (
                <span className="ml-auto text-[10px] font-black bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-xl flex items-center gap-1">
                  <Store className="h-3 w-3" /> Jan Aushadhi
                </span>
              )}
            </div>

            {/* Price Comparison — The Star UI */}
            <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
                {/* Branded Price */}
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Branded Price</p>
                  <p className="text-2xl font-black text-white">{result.brandedPrice}</p>
                  <p className="text-xs text-slate-500 mt-1">{result.brandedName}</p>
                </div>

                {/* Savings Center */}
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
                  <div className="relative z-10">
                    <BadgePercent className="h-8 w-8 text-emerald-400 mx-auto mb-1" />
                    <p className="text-5xl font-black text-emerald-400">{result.savingsPercent}%</p>
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-300 mt-1">You Save</p>
                  </div>
                </div>

                {/* Generic Price */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Generic Price</p>
                  <p className="text-2xl font-black text-emerald-300">{result.genericPrice}</p>
                  <p className="text-xs text-slate-400 mt-1">Jan Aushadhi / Generic</p>
                </div>
              </div>
            </div>

            {/* Alternatives */}
            {result.alternatives?.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Available Generic Brands</p>
                <div className="space-y-2">
                  {result.alternatives.map((alt, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-3.5 hover:border-emerald-500/20 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-white">{alt.name}</p>
                        <p className="text-xs text-slate-500">{alt.manufacturer}</p>
                      </div>
                      <span className="text-emerald-400 font-black text-sm flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" /> {alt.price}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Source & Disclaimer */}
            {result.source && (
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-xs text-sky-300 flex items-start gap-2">
                <TrendingDown className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>Price source: {result.source}</span>
              </div>
            )}
            {result.disclaimer && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-400 flex items-start gap-2">
                <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-slate-500" />
                <span>{result.disclaimer}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
