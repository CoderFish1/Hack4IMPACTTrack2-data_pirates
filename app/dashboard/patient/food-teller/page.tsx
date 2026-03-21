"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed, Upload, ArrowLeft, Loader2, AlertCircle,
  X, ShieldCheck, ShieldAlert, Flame, Leaf, Zap, Wheat
} from "lucide-react";
import Link from "next/link";

interface FoodResult {
  foodIdentified: string;
  estimatedCalories: string;
  safeToEat: boolean;
  recommendation: string;
  alternatives: string[];
  nutritionHighlights?: { protein: string; carbs: string; fat: string; fiber: string };
}

export default function FoodTellerPage() {
  const [base64, setBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodResult | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image."); return; }
    if (file.size > 20 * 1024 * 1024) { setError("Max 20MB."); return; }
    setError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality
        setPreview(dataUrl);
        setBase64(dataUrl); // Added this line to set the base64 state
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const analyze = async () => {
    if (!base64) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/food-teller", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64, patientCondition: condition }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch { setError("Analysis failed. Try again."); }
    finally { setLoading(false); }
  };

  const reset = () => { setBase64(null); setPreview(null); setResult(null); setError(""); };

  const nutIcons: Record<string, React.ReactNode> = {
    protein: <Zap className="h-3 w-3" />, carbs: <Wheat className="h-3 w-3" />,
    fat: <Flame className="h-3 w-3" />, fiber: <Leaf className="h-3 w-3" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patient" className="p-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
          <ArrowLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Food Teller — Dietary Scanner</h1>
          <p className="text-slate-400 text-sm mt-0.5">Snap a photo of your food. AI tells you if it&apos;s safe for your condition.</p>
        </div>
      </div>

      {/* Upload + Condition Input */}
      {!result && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Image upload */}
          {!preview ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current?.click()}
              className={`rounded-3xl border-2 border-dashed transition-all p-14 flex flex-col items-center gap-5 cursor-pointer ${
                dragging ? "border-orange-500/60 bg-orange-500/10" : "border-white/10 bg-white/[0.02] hover:border-orange-500/30"
              }`}>
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
              <div className="w-20 h-20 rounded-3xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                <UtensilsCrossed className="h-10 w-10 text-orange-400" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-black text-white mb-1">Upload a food photo</h2>
                <p className="text-slate-400 text-sm">Drop or click — JPG, PNG (max 20MB)</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-orange-500/20 bg-orange-500/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="h-5 w-5 text-orange-400" />
                  <span className="text-sm font-black uppercase tracking-widest text-orange-300/90">Food Image</span>
                </div>
                <button onClick={reset} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 max-h-[300px] flex items-center justify-center">
                <img src={preview} alt="Food" className="max-h-[300px] object-contain" />
              </div>
            </div>
          )}

          {/* Condition Input */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Your Medical Conditions (optional)
            </label>
            <input value={condition} onChange={e => setCondition(e.target.value)}
              placeholder="e.g. Type 2 Diabetes, High Blood Pressure, Kidney Disease..."
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-600" />
          </div>

          {/* Analyze Button */}
          {preview && (
            <button onClick={analyze}
              className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20">
              <UtensilsCrossed className="h-5 w-5" /> Analyze Food
            </button>
          )}
          {error && <p className="text-red-400 text-xs font-medium flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-3xl border border-orange-500/20 bg-orange-500/5 p-10 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-orange-400 animate-spin" />
          <p className="text-slate-300 font-bold">Analyzing your food...</p>
          <p className="text-slate-500 text-xs">Checking nutritional content against your condition</p>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* SAFE / AVOID Banner */}
            <div className={`rounded-3xl border-2 p-8 relative overflow-hidden ${
              result.safeToEat
                ? "border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_60px_rgba(16,185,129,0.25)]"
                : "border-red-500/40 bg-red-500/10 shadow-[0_0_60px_rgba(239,68,68,0.25)]"
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-b ${result.safeToEat ? "from-emerald-500/15" : "from-red-500/15"} to-transparent`} />
              <div className="relative z-10 flex flex-col items-center text-center gap-3">
                {result.safeToEat
                  ? <ShieldCheck className="h-12 w-12 text-emerald-400" />
                  : <ShieldAlert className="h-12 w-12 text-red-400" />
                }
                <p className={`text-4xl font-black ${result.safeToEat ? "text-emerald-400" : "text-red-400"}`}>
                  {result.safeToEat ? "SAFE TO EAT" : "AVOID"}
                </p>
                <p className="text-white font-bold text-lg">{result.foodIdentified}</p>
                <span className="text-slate-400 text-sm">~{result.estimatedCalories} calories</span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">AI Recommendation</p>
              <p className="text-slate-200 text-sm leading-relaxed">{result.recommendation}</p>
            </div>

            {/* Nutrition Highlights */}
            {result.nutritionHighlights && (
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(result.nutritionHighlights).map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                      {nutIcons[k]} <span className="uppercase font-black tracking-widest text-[9px]">{k}</span>
                    </div>
                    <p className="text-white font-black text-sm">{v}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Alternatives */}
            {result.alternatives?.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  🥗 Safer Alternatives
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.alternatives.map((alt, i) => (
                    <span key={i} className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl">
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white font-bold text-sm transition-all">
                <Upload className="h-4 w-4" /> Scan Another Food
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
