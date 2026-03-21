"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse, Lightbulb, Clock, ChevronRight,
  Activity, Shield, FileText, RefreshCw, Pill, Baby,
  Droplets, Calendar, Zap, Brain, TrendingUp, AlertCircle,
  Search, MapPin, Phone, CheckCircle, X, ChevronDown,
  Thermometer, Wind, Stethoscope
} from "lucide-react";
import Link from "next/link";

interface HealthTip { tip: string; category: string; emoji: string; }
interface TriageHistoryItem {
  id: string; createdAt: string; symptoms: string; intensity: number;
  result: { recommendation_level: string; possible_conditions: string[]; precautions: string[] };
}

// ──────────────────────────────────────────────
// Vitals Monitor — Web Bluetooth API + Simulation fallback
// ──────────────────────────────────────────────
type BluetoothStatus = "idle" | "connecting" | "connected" | "simulated" | "unsupported";

function VitalsMonitor() {
  const [vitals, setVitals] = useState({ hr: 72, spo2: 98, sys: 120, dia: 80, temp: 98.6 });
  const [alert, setAlert] = useState(false);
  const [btStatus, setBtStatus] = useState<BluetoothStatus>("idle");
  const [btDeviceName, setBtDeviceName] = useState<string | null>(null);
  const tick = useRef(0);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check Bluetooth availability once — do NOT auto-start simulation
  useEffect(() => {
    if (typeof navigator === "undefined" || !(navigator as any).bluetooth) {
      setBtStatus("unsupported");
    } else {
      setBtStatus("idle");
    }
    return () => { if (simIntervalRef.current) clearInterval(simIntervalRef.current); };
  }, []);

  const startSimulation = () => {
    if (simIntervalRef.current) return;
    simIntervalRef.current = setInterval(() => {
      tick.current += 1;
      const hr = 68 + Math.round(Math.sin(tick.current * 0.3) * 7 + Math.random() * 4);
      const spo2 = 97 + Math.round(Math.random() * 2);
      const sys = 118 + Math.round(Math.sin(tick.current * 0.2) * 5 + Math.random() * 4);
      const temp = +(98.4 + Math.random() * 0.6).toFixed(1);
      setVitals({ hr, spo2, sys, dia: 78 + Math.round(Math.random() * 4), temp });
      setAlert(hr > 80 || spo2 < 98);
    }, 1800);
  };

  const connectBluetooth = async () => {
    const bt = (navigator as any).bluetooth;
    if (!bt) { setBtStatus("unsupported"); return; }
    setBtStatus("connecting");
    try {
      // Request a Bluetooth device with health thermometer or heart rate services
      const device = await bt.requestDevice({
        filters: [
          { services: ["heart_rate"] },
          { services: ["health_thermometer"] },
          { services: ["blood_pressure"] },
          { namePrefix: "Mi" },
          { namePrefix: "Polar" },
          { namePrefix: "Fitbit" },
          { namePrefix: "Garmin" },
        ],
        optionalServices: ["heart_rate", "health_thermometer", "blood_pressure", "battery_service"],
      });
      setBtDeviceName(device.name || "Health Band");
      const server = await device.gatt.connect();
      setBtStatus("connected");
      // Stop simulation
      if (simIntervalRef.current) { clearInterval(simIntervalRef.current); simIntervalRef.current = null; }
      // Try to read heart rate from the GATT server
      try {
        const service = await server.getPrimaryService("heart_rate");
        const char = await service.getCharacteristic("heart_rate_measurement");
        await char.startNotifications();
        char.addEventListener("characteristicvaluechanged", (e: any) => {
          const val = e.target.value;
          // Heart rate is in byte index 1 (flags determine if uint8 or uint16)
          const hr = val.getUint8(1);
          setVitals(prev => ({ ...prev, hr }));
          setAlert(hr > 100 || hr < 50);
        });
      } catch {
        // Device doesn't support heart_rate service, resume simulation with connected status
        startSimulation();
      }
      device.addEventListener("gattserverdisconnected", () => {
        setBtStatus("simulated");
        setBtDeviceName(null);
        startSimulation();
      });
    } catch (err: any) {
      // User cancelled or device not found — go back to idle, don't simulate
      if (err?.name === "NotFoundError" || err?.message?.includes("cancelled") || err?.name === "AbortError") {
        setBtStatus("idle");
      } else {
        // Other error (e.g. device paired but GATT failed) — show simulated state
        setBtStatus("simulated");
        startSimulation();
      }
    }
  };

  const Metric = ({ icon, label, value, unit, color, warn }: {
    icon: React.ReactNode; label: string; value: string | number; unit: string; color: string; warn?: boolean;
  }) => (
    <div className={`rounded-2xl border p-4 flex flex-col gap-1 transition-all ${warn ? "border-amber-500/50 bg-amber-500/5" : "border-white/[0.08] bg-white/[0.02]"}`}>
      <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${color}`}>
        {icon} {label}
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-black text-white">{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      {warn && <span className="text-[10px] text-amber-400 font-bold">⚠ Slightly elevated</span>}
    </div>
  );

  const btBadge = {
    idle: { label: "Connect Band", style: "text-sky-400 border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 cursor-pointer", dot: "bg-slate-500", onClick: connectBluetooth },
    connecting: { label: "Pairing...", style: "text-amber-400 border-amber-500/30 bg-amber-500/5 cursor-not-allowed", dot: "bg-amber-400 animate-pulse", onClick: undefined },
    connected: { label: btDeviceName || "Band Connected", style: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5", dot: "bg-emerald-400 animate-pulse", onClick: undefined },
    simulated: { label: "Simulated (no band)", style: "text-slate-400 border-white/10 bg-white/[0.02]", dot: "bg-slate-500", onClick: connectBluetooth },
    unsupported: { label: "Simulated Mode", style: "text-slate-500 border-white/[0.06] bg-white/[0.01]", dot: "bg-slate-600", onClick: undefined },
  }[btStatus];

  return (
    <div className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className={`h-5 w-5 text-sky-400 ${btStatus === "connected" ? "animate-pulse" : ""}`} />
          <span className="text-sm font-black uppercase tracking-widest text-sky-300/90">Real-Time Vitals Monitor</span>
        </div>
        <button
          onClick={btBadge.onClick}
          disabled={!btBadge.onClick}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${btBadge.style}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${btBadge.dot}`} />
          {btBadge.label}
        </button>
      </div>

      {/* Not connected — show empty prompt */}
      {btStatus !== "connected" && btStatus !== "simulated" && (
        <div className="flex flex-col items-center justify-center py-10 gap-5">
          {/* Bluetooth icon */}
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border ${
            btStatus === "connecting"
              ? "border-amber-500/30 bg-amber-500/10 animate-pulse"
              : btStatus === "unsupported"
              ? "border-white/10 bg-white/[0.03]"
              : "border-sky-500/30 bg-sky-500/10"
          }`}>
            <svg className={`h-8 w-8 ${
              btStatus === "connecting" ? "text-amber-400" :
              btStatus === "unsupported" ? "text-slate-500" : "text-sky-400"
            }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 2L17 12L7 22" />
              <path d="M17 2L7 12L17 22" opacity="0.4"/>
              <path d="M7 12H17" />
            </svg>
          </div>
          {btStatus === "unsupported" ? (
            <div className="text-center">
              <p className="text-slate-400 font-bold text-sm">Web Bluetooth Not Supported</p>
              <p className="text-slate-600 text-xs mt-1">Use Chrome or Edge on Android/Desktop to connect a health band.</p>
            </div>
          ) : btStatus === "connecting" ? (
            <div className="text-center">
              <p className="text-amber-300 font-bold text-sm">Pairing with device...</p>
              <p className="text-slate-500 text-xs mt-1">Check your phone's Bluetooth popup to approve connection.</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-300 font-bold text-sm">No device connected</p>
              <p className="text-slate-500 text-xs mt-1 max-w-xs">
                Tap <span className="text-sky-400 font-bold">Connect Band</span> to pair a Bluetooth health device — Mi Band, Polar, Fitbit, Garmin, or any BLE heart rate monitor.
              </p>
            </div>
          )}
          {btStatus === "idle" && (
            <button
              onClick={connectBluetooth}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-black text-sm transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 2L17 12L7 22" /><path d="M7 12H17" />
              </svg>
              Connect Bluetooth Band
            </button>
          )}
        </div>
      )}

      {/* Connected or simulated — show vitals */}
      {(btStatus === "connected" || btStatus === "simulated") && (
        <>
          {btStatus === "simulated" && (
            <div className="mb-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[10px] text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              Band pairing failed — showing simulated readings.
              <button onClick={connectBluetooth} className="ml-auto text-sky-500 font-bold hover:underline">Retry</button>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric icon={<HeartPulse className="h-3 w-3" />} label="Heart Rate" value={vitals.hr} unit="bpm" color="text-rose-400" warn={vitals.hr > 80} />
            <Metric icon={<Wind className="h-3 w-3" />} label="SpO₂" value={vitals.spo2} unit="%" color="text-sky-400" warn={vitals.spo2 < 98} />
            <Metric icon={<Stethoscope className="h-3 w-3" />} label="Blood Pressure" value={`${vitals.sys}/${vitals.dia}`} unit="mmHg" color="text-violet-400" />
            <Metric icon={<Thermometer className="h-3 w-3" />} label="Temperature" value={vitals.temp} unit="°F" color="text-amber-400" />
          </div>
          {alert && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-amber-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" /> Predictive alert: Minor variation detected. Monitor closely.
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Rx Price Finder
// ──────────────────────────────────────────────
interface RxResult {
  brand_name: string; generic_name: string; brand_price: string; generic_price: string;
  savings_percent: number;
  alternatives: { name: string; price: string; manufacturer: string }[];
  availability: string; safety_note: string;
}

function RxPriceFinder() {
  const [drug, setDrug] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RxResult | null>(null);
  const [error, setError] = useState("");

  const search = async () => {
    if (!drug.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/rx-finder", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugName: drug }),
      });
      const data = await res.json() as RxResult;
      if (res.ok) setResult(data);
      else throw new Error();
    } catch { setError("Failed to fetch pricing. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Pill className="h-5 w-5 text-emerald-400" />
        <span className="text-sm font-black uppercase tracking-widest text-emerald-300/90">Rx Price Finder</span>
        <span className="ml-auto text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-lg font-bold">Save up to 90%</span>
      </div>
      <p className="text-slate-400 text-xs mb-4">Enter a prescription drug name to find cheaper generic alternatives.</p>
      <div className="flex gap-2">
        <input value={drug} onChange={e => setDrug(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
          placeholder="e.g. Metformin, Lisinopril, Clopidogrel..."
          className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-600" />
        <button onClick={search} disabled={loading}
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm disabled:opacity-60 flex items-center gap-2 transition-all">
          <Search className="h-4 w-4" />{loading ? "..." : "Find"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-4 space-y-2">
            <div className="h-4 bg-white/5 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-4/5" />
          </motion.div>
        )}
        {result && (
          <motion.div key="rx-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
            {/* Price comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Brand Price</p>
                <p className="text-lg font-black text-white">{result.brand_price}</p>
                <p className="text-xs text-slate-400 mt-0.5">{result.brand_name}</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Generic Price</p>
                <p className="text-lg font-black text-emerald-300">{result.generic_price}</p>
                <p className="text-xs text-slate-400 mt-0.5">{result.generic_name}</p>
              </div>
            </div>
            {/* Savings badge */}
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-300 font-black text-sm">You save ~{result.savings_percent}%</span>
              <span className="text-slate-400 text-xs ml-1">with generic alternatives</span>
            </div>
            {/* Alternatives */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Top Generic Brands</p>
              <div className="space-y-2">
                {result.alternatives?.map((alt, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                    <div>
                      <p className="text-sm font-bold text-white">{alt.name}</p>
                      <p className="text-xs text-slate-500">{alt.manufacturer}</p>
                    </div>
                    <span className="text-emerald-400 font-black text-sm">{alt.price}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Availability */}
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-xs text-sky-300 flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{result.availability}</span>
            </div>
            {result.safety_note && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-400 flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-slate-500" />
                <span>{result.safety_note}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────
// AI Specialist Matcher
// ──────────────────────────────────────────────
interface MatcherResult {
  specialties: { name: string; match_score: number; reason: string }[];
  doctors: { name: string; specialty: string; available_today: boolean; distance: string }[];
  urgency: "Emergency" | "See Doctor Soon" | "Routine";
  advice: string;
}

function SpecialistMatcher() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatcherResult | null>(null);
  const [error, setError] = useState("");

  const match = async () => {
    if (!symptoms.trim()) { setError("Please describe your symptoms."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json() as MatcherResult;
      if (res.ok) setResult(data);
      else throw new Error();
    } catch { setError("Matching failed. Please try again."); }
    finally { setLoading(false); }
  };

  const priorityStyle = { Emergency: "text-red-400 bg-red-500/10 border-red-500/30", "See Doctor Soon": "text-amber-400 bg-amber-500/10 border-amber-500/30", Routine: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };

  return (
    <div className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Stethoscope className="h-5 w-5 text-violet-400" />
        <span className="text-sm font-black uppercase tracking-widest text-violet-300/90">AI Specialist Matcher</span>
        <span className="ml-auto text-[10px] bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2 py-0.5 rounded-lg font-bold">Smart Routing</span>
      </div>
      <p className="text-slate-400 text-xs mb-4">Describe your symptoms and AI will instantly connect you with the right specialist.</p>
      
      <div className="mb-3">
        <input value={symptoms} onChange={e => setSymptoms(e.target.value)}
          placeholder="E.g. Sharp pain in lower right abdomen, mild fever..."
          className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none placeholder:text-slate-600" />
      </div>
      {error && <p className="text-red-400 text-xs mb-2 font-medium">{error}</p>}
      
      <button onClick={match} disabled={loading}
        className="w-full py-3 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-black text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
        <Zap className="h-4 w-4" />{loading ? "Analyzing symptoms..." : "Find Right Specialist"}
      </button>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 space-y-2">
            <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-2/3" />
          </motion.div>
        )}
        {result && (
          <motion.div key="matcher-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
            
            <div className="flex items-start justify-between">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${priorityStyle[result.urgency]}`}>
                {result.urgency}
              </span>
            </div>

            {/* Specialties */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Recommended Specialties</p>
              <div className="space-y-2">
                {result.specialties?.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-black text-sm flex-shrink-0">
                      {s.match_score}%
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{s.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">{s.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-slate-500 dark:text-slate-400" />
              <span>{result.advice}</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────
// Pregnancy Week Tracker
// ──────────────────────────────────────────────
const PREGNANCY_DATA: Record<number, { size: string; development: string; tip: string; symptoms: string; emoji: string }> = {
  4: { size: "Poppy seed", development: "Neural tube forming. Heart begins to beat.", tip: "Start prenatal vitamins with folic acid.", symptoms: "Missed period, mild cramping.", emoji: "🌱" },
  6: { size: "Lentil", development: "Facial features developing. Heart has 4 chambers.", tip: "Avoid raw fish, alcohol and smoking.", symptoms: "Morning sickness, breast tenderness.", emoji: "🫘" },
  8: { size: "Raspberry", development: "Baby moves, though you can't feel it yet. All organs forming.", tip: "Book your first prenatal ultrasound.", symptoms: "Fatigue, nausea peak this week.", emoji: "🍇" },
  10: { size: "Kumquat", development: "Vital organs are fully formed. Baby can swallow.", tip: "Gentle walking is excellent exercise.", symptoms: "Mood swings, frequent urination.", emoji: "🍊" },
  12: { size: "Lime", development: "First trimester ends! Risk of miscarriage drops significantly.", tip: "It's safe to share your pregnancy news!", symptoms: "Nausea easing, energy returning.", emoji: "🟢" },
  16: { size: "Avocado", development: "Baby can hear sounds. Gender may be visible on ultrasound.", tip: "Start sleeping on your left side.", symptoms: "Round ligament pain, nasal congestion.", emoji: "🥑" },
  20: { size: "Banana", development: "Halfway there! Baby's movements felt clearly.", tip: "Anatomy scan (anomaly scan) scheduled around now.", symptoms: "Back pain, leg cramps begin.", emoji: "🍌" },
  24: { size: "Corn", development: "Lungs developing rapidly. Baby's face fully formed.", tip: "Glucose challenge test typically done this week.", symptoms: "Braxton Hicks contractions may start.", emoji: "🌽" },
  28: { size: "Eggplant", development: "Baby opens eyes, blinks. Third trimester begins!", tip: "Start kick counting — 10 kicks in 2 hours.", symptoms: "Heartburn, shortness of breath.", emoji: "🍆" },
  32: { size: "Jicama", development: "Baby practices breathing. Position may be head-down now.", tip: "Pack your hospital bag this week.", symptoms: "Pelvic pressure, vivid dreams.", emoji: "🫙" },
  36: { size: "Honeydew", development: "Most organs mature. Baby preparing for birth.", tip: "Weekly prenatal visits begin now.", symptoms: "Difficulty sleeping, pelvic discomfort.", emoji: "🍈" },
  40: { size: "Watermelon", development: "Full term! Baby ready to meet you.", tip: "Stay calm, watch for labor signs.", symptoms: "Nesting instinct, irregular contractions.", emoji: "🍉" },
};

function getWeekData(week: number) {
  const keys = Object.keys(PREGNANCY_DATA).map(Number).sort((a, b) => a - b);
  const nearestKey = keys.reduce((prev, curr) => Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev);
  return PREGNANCY_DATA[nearestKey];
}

function PregnancyTracker() {
  const [lmpDate, setLmpDate] = useState("");
  const [week, setWeek] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const calculate = () => {
    if (!lmpDate) return;
    const lmp = new Date(lmpDate);
    const now = new Date("2026-03-21");
    const diffDays = Math.floor((now.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
    const w = Math.min(Math.max(Math.floor(diffDays / 7), 1), 40);
    setWeek(w);
    setOpen(true);
  };

  const trimester = week ? (week <= 12 ? 1 : week <= 27 ? 2 : 3) : null;
  const progress = week ? Math.round((week / 40) * 100) : 0;
  const weekData = week ? getWeekData(week) : null;

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="rounded-3xl border border-pink-500/20 bg-pink-500/5 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Baby className="h-5 w-5 text-pink-400" />
        <span className="text-sm font-black uppercase tracking-widest text-pink-300/90">Pregnancy Tracker</span>
        <button onClick={() => setOpen(o => !o)} className="ml-auto text-slate-400 hover:text-white transition-colors">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <div className="flex gap-3">
        <input type="date" value={lmpDate} onChange={e => setLmpDate(e.target.value)}
          max="2026-03-21"
          className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
        <button onClick={calculate}
          className="px-5 py-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-sm transition-all">
          Track
        </button>
      </div>
      <p className="text-slate-500 text-xs mt-2">Enter your last menstrual period (LMP) date</p>

      <AnimatePresence>
        {open && week && weekData && (
          <motion.div key="preg-data" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-5">
              {/* Progress ring + week */}
              <div className="flex items-center gap-6 mb-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(236,72,153,0.15)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="10"
                      strokeDasharray={circumference} strokeDashoffset={circumference - (progress / 100) * circumference}
                      strokeLinecap="round" className="transition-all duration-700" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white">W{week}</span>
                    <span className="text-[10px] text-pink-400 font-bold">T{trimester}</span>
                  </div>
                </div>
                <div>
                  <p className="text-white font-black text-lg">Week {week} of 40</p>
                  <p className="text-pink-300 text-sm">Trimester {trimester}</p>
                  <p className="text-slate-400 text-xs mt-1">Baby is the size of a <span className="text-white font-bold">{weekData.size}</span> {weekData.emoji}</p>
                  {week < 40 && <p className="text-slate-500 text-xs mt-0.5">{40 - week} weeks to go</p>}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-1.5">Development</p>
                  <p className="text-slate-200 text-sm leading-relaxed">{weekData.development}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Symptoms</p>
                    <p className="text-slate-300 text-xs leading-relaxed">{weekData.symptoms}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Weekly Tip</p>
                    <p className="text-slate-300 text-xs leading-relaxed">{weekData.tip}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────
// Blood Donor Finder
// ──────────────────────────────────────────────
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
interface BloodDonorResult {
  blood_type_needed: string;
  compatible_types: string[];
  donors: { id: string; name: string; blood_type: string; distance: string; last_donated: string; contact: string; status: string }[];
  blood_banks: { name: string; address: string; distance: string; units_available: number; contact: string; open_24h: boolean }[];
  emergency_note: string;
}

function BloodDonorFinder() {
  const [bloodType, setBloodType] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BloodDonorResult | null>(null);
  const [error, setError] = useState("");

  const search = async () => {
    if (!bloodType) { setError("Please select a blood type."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/blood-donor", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bloodType, location }),
      });
      const data = await res.json() as BloodDonorResult;
      if (res.ok) setResult(data);
      else throw new Error();
    } catch { setError("Search failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-6">
      <div className="flex items-center gap-3 mb-2">
        <Droplets className="h-5 w-5 text-red-400 animate-pulse" />
        <span className="text-sm font-black uppercase tracking-widest text-red-300/90">Emergency Blood Donor Finder</span>
      </div>
      <p className="text-slate-400 text-xs mb-4">Find compatible donors and blood banks near you in an emergency.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <select value={bloodType} onChange={e => setBloodType(e.target.value)}
          className="bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none">
          <option value="">Select Blood Type...</option>
          {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
        </select>
        <input value={location} onChange={e => setLocation(e.target.value)}
          placeholder="Your city/area (optional)"
          className="bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-600" />
      </div>
      {error && <p className="text-red-400 text-xs mb-2 font-medium">{error}</p>}
      <button onClick={search} disabled={loading}
        className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
        <Droplets className="h-4 w-4" />{loading ? "Searching..." : "Find Donors & Blood Banks"}
      </button>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 space-y-2">
            <div className="h-4 bg-red-500/10 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-red-500/10 rounded animate-pulse w-full" />
            <div className="h-4 bg-red-500/10 rounded animate-pulse w-4/5" />
          </motion.div>
        )}
        {result && (
          <motion.div key="blood-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
            {/* Compatible types */}
            {result.compatible_types?.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Compatible Blood Types</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs font-black bg-red-500/20 border border-red-500/30 text-red-300 px-2 py-1 rounded-lg">{result.blood_type_needed} ✓ Exact</span>
                  {result.compatible_types.map(bt => (
                    <span key={bt} className="text-xs font-bold bg-white/5 border border-white/10 text-slate-300 px-2 py-1 rounded-lg">{bt}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Blood banks */}
            {result.blood_banks?.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Blood Banks</p>
                <div className="space-y-2">
                  {result.blood_banks.map((bb, i) => (
                    <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{bb.name}</p>
                            {bb.open_24h && <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">24H</span>}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">{bb.address}</p>
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                          <p className={`text-sm font-black ${bb.units_available > 3 ? "text-emerald-600 dark:text-emerald-400" : bb.units_available > 1 ? "text-amber-500 dark:text-amber-400" : "text-red-500 dark:text-red-400"}`}>
                            {bb.units_available} units
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <a href={`tel:${bb.contact}`} className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
                              <Phone className="h-3 w-3" /> Call
                            </a>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bb.name + ' ' + bb.address)}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                            >
                              <MapPin className="h-3 w-3" /> Map
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.emergency_note && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>{result.emergency_note}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Patient Dashboard
// ──────────────────────────────────────────────
export default function PatientDashboard() {
  const [tip, setTip] = useState<HealthTip | null>(null);
  const [tipLoading, setTipLoading] = useState(true);
  const [history, setHistory] = useState<TriageHistoryItem[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("medai-triage-history") || "[]") as TriageHistoryItem[];
    setHistory(stored.slice(0, 5));
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
    } finally { setTipLoading(false); }
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
        <p className="text-slate-400 mt-1">Monitor your health and access AI-powered features anytime.</p>
      </div>

      {/* AI Diagnostics Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { value: "94.7%", label: "AI Accuracy", icon: <Brain className="h-4 w-4" />, color: "text-sky-400 border-sky-500/20 bg-sky-500/5" },
          { value: "200+", label: "Conditions", icon: <Stethoscope className="h-4 w-4" />, color: "text-violet-400 border-violet-500/20 bg-violet-500/5" },
          { value: "4", label: "AI Agents", icon: <Zap className="h-4 w-4" />, color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
          { value: "<30s", label: "Analysis Time", icon: <Clock className="h-4 w-4" />, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-4 ${stat.color}`}>
            <div className="flex items-center gap-2 mb-1 opacity-80">{stat.icon}<span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span></div>
            <p className="text-xl font-black text-white">{stat.value}</p>
          </motion.div>
        ))}
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

      {/* Real-Time Vitals */}
      <VitalsMonitor />

      {/* Rx Price Finder */}
      <RxPriceFinder />

      {/* Smart Scheduling */}
      <SpecialistMatcher />

      {/* Pregnancy Tracker */}
      <PregnancyTracker />

      {/* Blood Donor Finder */}
      <BloodDonorFinder />

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-400" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">Triage History</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">{history.length} Sessions</span>
        </div>
        {history.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center">
            <HeartPulse className="h-10 w-10 text-slate-600/50 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">No triage history yet.</p>
            <p className="text-slate-500 text-xs mt-1">Start your first AI triage session above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((h, i) => {
              const urgencyColor = h.result?.recommendation_level === "Immediate ER" ? "border-red-500/50" :
                                   h.result?.recommendation_level === "Urgent Care" ? "border-amber-500/50" :
                                   h.result?.recommendation_level === "See Doctor Soon" ? "border-sky-500/50" :
                                   "border-emerald-500/50";
              const bgFade = h.result?.recommendation_level === "Immediate ER" ? "bg-gradient-to-r from-red-500/10 to-transparent" :
                             h.result?.recommendation_level === "Urgent Care" ? "bg-gradient-to-r from-amber-500/10 to-transparent" :
                             h.result?.recommendation_level === "See Doctor Soon" ? "bg-gradient-to-r from-sky-500/10 to-transparent" :
                             "bg-gradient-to-r from-emerald-500/10 to-transparent";

              return (
                <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className={`relative overflow-hidden rounded-2xl border bg-white/[0.02] shadow-sm ${urgencyColor} pl-4`}>
                  <div className={`absolute inset-0 w-24 ${bgFade} pointer-events-none`} />
                  <div className="p-5 pl-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${levelColor(h.result?.recommendation_level || "")}`}>
                          {h.result?.recommendation_level || "—"}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {new Date(h.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • {new Date(h.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-slate-200 font-medium text-sm line-clamp-2 mt-2 leading-relaxed">&ldquo;{h.symptoms}&rdquo;</p>
                      
                      {h.result?.possible_conditions?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {h.result.possible_conditions.slice(0, 3).map((c) => (
                            <span key={c} className="text-[10px] font-bold bg-white/[0.04] border border-white/10 text-slate-300 px-2.5 py-1 rounded-lg shadow-sm">
                              {c}
                            </span>
                          ))}
                          {h.result.possible_conditions.length > 3 && (
                            <span className="text-[10px] font-bold text-slate-500 px-1 py-1">+{h.result.possible_conditions.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
