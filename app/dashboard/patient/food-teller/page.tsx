"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed, ArrowLeft, Loader2, AlertCircle,
  RefreshCw, ShieldCheck, ShieldAlert, Flame, Leaf, Zap, Wheat, Clock
} from "lucide-react";
import Link from "next/link";

interface FoodResult {
  foodIdentified: string;
  estimatedCalories: string;
  safeToEat: boolean;
  recommendation: string;
  whatToEatInstead?: string[];
  whenToEat?: string;
  nutritionHighlights?: { protein: string; carbs: string; fat: string; fiber: string };
}

export default function FoodTellerPage() {
  const [foodText, setFoodText] = useState("");
  const [condition, setCondition] = useState("");
  const [mealType, setMealType] = useState("Snack");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodResult | null>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!foodText.trim()) { setError("Please enter what you ate."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/food-teller", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodText, patientCondition: condition || "None", mealType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch { setError("Analysis failed. Try again."); }
    finally { setLoading(false); }
  };

  const reset = () => { setFoodText(""); setResult(null); setError(""); };

  const nutIcons: Record<string, React.ReactNode> = {
    protein: <Zap className="h-3 w-3" />, carbs: <Wheat className="h-3 w-3" />,
    fat: <Flame className="h-3 w-3" />, fiber: <Leaf className="h-3 w-3" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patient" className="p-2 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors shadow-sm dark:shadow-none">
          <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Food Teller — Dietary Analyzer</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Enter a meal or food item to see if it&apos;s safe for your condition</p>
        </div>
      </div>

      {/* Inputs */}
      {!result && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          
          <div className="rounded-2xl border border-orange-500/20 bg-orange-50 dark:bg-orange-500/5 p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <UtensilsCrossed className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              <span className="text-sm font-black uppercase tracking-widest text-orange-600 dark:text-orange-300/90">What did you eat?</span>
            </div>
            <textarea 
              value={foodText} 
              onChange={e => setFoodText(e.target.value)}
              placeholder="e.g. A large slice of pepperoni pizza, 2 eggs, and a black coffee"
              rows={3}
              className="w-full bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none shadow-sm dark:shadow-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-black/5 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] p-6 space-y-4 shadow-sm dark:shadow-none">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                Your Medical Conditions (optional)
              </label>
              <input 
                value={condition} 
                onChange={e => setCondition(e.target.value)}
                placeholder="e.g. Type 2 Diabetes, High Blood Pressure"
                className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600" 
              />
            </div>
            
            <div className="rounded-2xl border border-black/5 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] p-6 space-y-4 shadow-sm dark:shadow-none">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                Meal Type
              </label>
              <select 
                value={mealType} 
                onChange={e => setMealType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none appearance-none" 
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
                <option value="Pre-Workout">Pre-Workout</option>
                <option value="Post-Workout">Post-Workout</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-xs font-medium flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}
          
          <button onClick={analyze}
            className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 dark:hover:bg-orange-400 text-white dark:text-black font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20">
            <UtensilsCrossed className="h-5 w-5" /> Analyze Food Safety
          </button>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-3xl border border-orange-500/20 bg-orange-50 dark:bg-orange-500/5 p-10 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-orange-500 dark:text-orange-400 animate-spin" />
          <p className="text-slate-900 dark:text-slate-300 font-bold">Analyzing your meal...</p>
          <p className="text-slate-600 dark:text-slate-500 text-xs">Checking nutritional content against your medical profile</p>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className={`rounded-3xl border-2 p-8 relative overflow-hidden bg-white dark:bg-transparent shadow-md dark:shadow-none ${
              result.safeToEat
                ? "border-emerald-500/40 dark:bg-emerald-500/10 dark:shadow-[0_0_60px_rgba(16,185,129,0.25)]"
                : "border-red-500/40 dark:bg-red-500/10 dark:shadow-[0_0_60px_rgba(239,68,68,0.25)]"
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-b ${result.safeToEat ? "from-emerald-50 dark:from-emerald-500/15" : "from-red-50 dark:from-red-500/15"} to-transparent`} />
              <div className="relative z-10 flex flex-col items-center text-center gap-3">
                {result.safeToEat
                  ? <ShieldCheck className="h-12 w-12 text-emerald-500 dark:text-emerald-400" />
                  : <ShieldAlert className="h-12 w-12 text-red-500 dark:text-red-400" />
                }
                <p className={`text-4xl font-black ${result.safeToEat ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {result.safeToEat ? "SAFE TO EAT" : "AVOID"}
                </p>
                <p className="text-slate-900 dark:text-white font-bold text-lg">{result.foodIdentified}</p>
                <span className="text-slate-600 dark:text-slate-400 text-sm">~{result.estimatedCalories} calories</span>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] p-6 shadow-sm dark:shadow-none">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">AI Recommendation</p>
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{result.recommendation}</p>
            </div>
            
            {result.whenToEat && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-50 dark:bg-sky-500/5 p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-300">When to Eat This</p>
                </div>
                <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{result.whenToEat}</p>
              </div>
            )}

            {result.nutritionHighlights && (
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(result.nutritionHighlights).map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-black/5 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] p-3 text-center shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-600 dark:text-slate-400 mb-1">
                      {nutIcons[k]} <span className="uppercase font-black tracking-widest text-[9px]">{k}</span>
                    </div>
                    <p className="text-slate-900 dark:text-white font-black text-sm">{v}</p>
                  </div>
                ))}
              </div>
            )}

            {result.whatToEatInstead && result.whatToEatInstead.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                  🥗 What to Eat Instead (Better Options)
                </p>
                <div className="flex flex-col gap-2">
                  {result.whatToEatInstead.map((alt, i) => (
                    <div key={i} className="text-sm font-medium bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 py-3 px-4 rounded-xl flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {alt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <button onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-bold text-sm transition-all shadow-sm dark:shadow-none">
                <RefreshCw className="h-4 w-4" /> Analyze Another Meal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
