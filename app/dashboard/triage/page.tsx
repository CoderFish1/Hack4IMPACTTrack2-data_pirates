"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity, AlertTriangle, Mic, MicOff,
  XCircle, HeartPulse, Users,
  Stethoscope, Brain, Heart, Shield, FileText, MapPin, Pill, Plus, PhoneCall,
  MessageSquare, Check, RefreshCcw, ChevronDown, ChevronUp
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface AIResult {
  possible_conditions: string[];
  precautions: string[];
  recommendation_level: "Self-Care" | "Consult Doctor" | "Urgent Care";
  specialist_debate: { role: string; insight: string }[];
  medication_warning?: string | null;
}
interface TriageHistoryItem {
  id: string;
  createdAt: string;
  symptoms: string;
  intensity: number;
  background: string[];
  medications: string[];
  result: AIResult;
}

/* ─── Constants ──────────────────────────────────────────────────────── */
const QUICK_SYMPTOMS = ["Fever", "Cough", "Dizziness", "Nausea", "Chest Pain", "Shortness of Breath"];
const CONDITION_DETAILS: Record<string, string> = {
  Hypertension: "Blood pressure may be above recommended range. Track BP daily and reduce sodium intake.",
  "Acute Coronary Syndrome (Rule Out)": "Urgent cardiac evaluation is recommended to exclude serious heart causes.",
  "Viral Respiratory Infection": "Likely self-limited but monitor fever, cough, and breathing changes.",
  Gastritis: "Stomach lining irritation. Avoid spicy foods and monitor for persistent pain or bleeding.",
};

type AgentMeta = { icon: React.ReactNode; lightColor: string; darkColor: string; lightBg: string; darkBg: string };
const AGENT_META: Record<string, AgentMeta> = {
  "Cardiologist":         { icon: <Heart    className="h-4 w-4" />, lightColor: "text-rose-600",    darkColor: "dark:text-rose-400",    lightBg: "bg-rose-50 border-rose-200",    darkBg: "dark:bg-rose-500/10 dark:border-rose-500/20"    },
  "Neurologist":          { icon: <Brain    className="h-4 w-4" />, lightColor: "text-violet-600",  darkColor: "dark:text-violet-400",  lightBg: "bg-violet-50 border-violet-200",  darkBg: "dark:bg-violet-500/10 dark:border-violet-500/20"  },
  "General Practitioner": { icon: <Stethoscope className="h-4 w-4" />, lightColor: "text-emerald-600", darkColor: "dark:text-emerald-400", lightBg: "bg-emerald-50 border-emerald-200", darkBg: "dark:bg-emerald-500/10 dark:border-emerald-500/20" },
};

/* ─── Country codes ──────────────────────────────────────────────────── */
const COUNTRY_CODES = [
  { flag: "🇮🇳", code: "+91",  label: "IN" },
  { flag: "🇺🇸", code: "+1",   label: "US" },
  { flag: "🇬🇧", code: "+44",  label: "GB" },
  { flag: "🇦🇺", code: "+61",  label: "AU" },
  { flag: "🇦🇪", code: "+971", label: "AE" },
  { flag: "🇸🇬", code: "+65",  label: "SG" },
  { flag: "🇨🇦", code: "+1",   label: "CA" },
];

/* ─── Sync status type ───────────────────────────────────────────────── */
type SyncStatus = "idle" | "syncing" | "synced" | "error";

/* ═══════════════════════════════════════════════════════════════════════
   WHATSAPP SYNC CARD COMPONENT
══════════════════════════════════════════════════════════════════════ */
function WhatsAppSyncCard({
  enabled, onToggle,
  phoneNumber, onPhoneChange,
  emergencyContact, onEmergencyChange,
  syncStatus,
}: {
  enabled: boolean;
  onToggle: () => void;
  phoneNumber: string;
  onPhoneChange: (v: string) => void;
  emergencyContact: string;
  onEmergencyChange: (v: string) => void;
  syncStatus: SyncStatus;
}) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [emergencyCountry, setEmergencyCountry] = useState(COUNTRY_CODES[0]);
  const [showEmergency, setShowEmergency] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [emergencyCountryOpen, setEmergencyCountryOpen] = useState(false);

  // Persist country selection
  useEffect(() => {
    const saved = localStorage.getItem("medai-wa-country");
    if (saved) setSelectedCountry(JSON.parse(saved));
    const savedE = localStorage.getItem("medai-wa-ecountry");
    if (savedE) setEmergencyCountry(JSON.parse(savedE));
    const savedShowE = localStorage.getItem("medai-wa-show-emergency");
    if (savedShowE) setShowEmergency(savedShowE === "true");
  }, []);

  const handleCountrySelect = (c: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(c);
    setCountryOpen(false);
    localStorage.setItem("medai-wa-country", JSON.stringify(c));
  };
  const handleECountrySelect = (c: typeof COUNTRY_CODES[0]) => {
    setEmergencyCountry(c);
    setEmergencyCountryOpen(false);
    localStorage.setItem("medai-wa-ecountry", JSON.stringify(c));
  };

  const fullPhone = phoneNumber ? `${selectedCountry.code}${phoneNumber.replace(/\s/g, "")}` : "";
  const fullEmergency = emergencyContact ? `${emergencyCountry.code}${emergencyContact.replace(/\s/g, "")}` : "";

  // Sync full numbers upward
  useEffect(() => { if (phoneNumber) onPhoneChange(fullPhone); }, [selectedCountry]);
  useEffect(() => { if (emergencyContact) onEmergencyChange(fullEmergency); }, [emergencyCountry]);

  const handlePhoneInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const full = `${selectedCountry.code}${digits}`;
    onPhoneChange(full);
    localStorage.setItem("medai-wa-phone", full);
  };

  const handleEmergencyInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const full = `${emergencyCountry.code}${digits}`;
    onEmergencyChange(full);
    localStorage.setItem("medai-wa-emergency", full);
  };

  const displayPhone = phoneNumber.startsWith(selectedCountry.code)
    ? phoneNumber.slice(selectedCountry.code.length)
    : phoneNumber;
  const displayEmergency = emergencyContact.startsWith(emergencyCountry.code)
    ? emergencyContact.slice(emergencyCountry.code.length)
    : emergencyContact;

  return (
    <div className="relative bg-indigo-950/30 border border-indigo-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-[0_0_40px_rgba(99,102,241,0.15)] overflow-hidden">
      {/* Glow accent */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-inner">
            <MessageSquare className="h-4 w-4 text-indigo-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-100 leading-tight">WhatsApp Med-Safe Sync</p>
            <p className="text-[11px] text-indigo-400/80 mt-0.5">
              Link WhatsApp for real-time Med-Safe alerts and instant SBAR reports.
            </p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={onToggle}
          aria-label="Toggle WhatsApp Sync"
          className={`relative w-12 h-6 rounded-full transition-all duration-300 border ${
            enabled
              ? "bg-indigo-500 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
              : "bg-slate-800 border-slate-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
              enabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Expandable panel */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-4">
              {/* Patient phone input */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 block">
                  Your WhatsApp Number
                </label>
                <div className="flex gap-2">
                  {/* Country selector */}
                  <div className="relative">
                    <button
                      onClick={() => setCountryOpen(!countryOpen)}
                      className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-100 rounded-xl px-3 py-3 text-sm font-bold h-full hover:border-indigo-400/50 transition-colors"
                    >
                      <span className="text-base">{selectedCountry.flag}</span>
                      <span className="text-xs text-indigo-300">{selectedCountry.code}</span>
                      <ChevronDown className="h-3 w-3 text-indigo-400" />
                    </button>
                    <AnimatePresence>
                      {countryOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 mt-1 z-50 bg-[#0c0e1e] border border-indigo-500/30 rounded-xl overflow-hidden shadow-2xl min-w-[120px]"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <button
                              key={`${c.label}-${c.code}`}
                              onClick={() => handleCountrySelect(c)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-100 hover:bg-indigo-500/20 transition-colors"
                            >
                              <span>{c.flag}</span>
                              <span className="text-xs text-indigo-400">{c.code}</span>
                              <span className="text-xs text-indigo-300 ml-1">{c.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone number input */}
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                    defaultValue={displayPhone}
                    onChange={(e) => handlePhoneInput(e.target.value)}
                    className="flex-1 bg-indigo-950/40 border border-indigo-500/30 text-indigo-100 placeholder:text-indigo-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
                  />
                </div>
              </div>

              {/* Sync status indicator */}
              <AnimatePresence>
                {syncStatus === "syncing" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2 text-indigo-300 text-xs font-bold"
                  >
                    <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                    Syncing to Cloud...
                  </motion.div>
                )}
                {syncStatus === "synced" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2 text-emerald-400 text-xs font-bold"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Synced to WhatsApp
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Emergency contact (Amrit) expander */}
              <div>
                <button
                  onClick={() => {
                    const next = !showEmergency;
                    setShowEmergency(next);
                    localStorage.setItem("medai-wa-show-emergency", String(next));
                  }}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400/80 hover:text-indigo-300 transition-colors"
                >
                  {showEmergency ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  Emergency Contact (Amrit)
                </button>

                <AnimatePresence>
                  {showEmergency && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden mt-2"
                    >
                      <div className="flex gap-2">
                        {/* Emergency country selector */}
                        <div className="relative">
                          <button
                            onClick={() => setEmergencyCountryOpen(!emergencyCountryOpen)}
                            className="flex items-center gap-2 bg-rose-950/40 border border-rose-500/30 text-rose-100 rounded-xl px-3 py-3 text-sm font-bold h-full hover:border-rose-400/50 transition-colors"
                          >
                            <span className="text-base">{emergencyCountry.flag}</span>
                            <span className="text-xs text-rose-300">{emergencyCountry.code}</span>
                            <ChevronDown className="h-3 w-3 text-rose-400" />
                          </button>
                          <AnimatePresence>
                            {emergencyCountryOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute top-full left-0 mt-1 z-50 bg-[#0c0e1e] border border-rose-500/30 rounded-xl overflow-hidden shadow-2xl min-w-[120px]"
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <button
                                    key={`e-${c.label}-${c.code}`}
                                    onClick={() => handleECountrySelect(c)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-100 hover:bg-rose-500/20 transition-colors"
                                  >
                                    <span>{c.flag}</span>
                                    <span className="text-xs text-rose-400">{c.code}</span>
                                    <span className="text-xs text-rose-300 ml-1">{c.label}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="Emergency number (Amrit)"
                          defaultValue={displayEmergency}
                          onChange={(e) => handleEmergencyInput(e.target.value)}
                          className="flex-1 bg-rose-950/20 border border-rose-500/30 text-rose-100 placeholder:text-rose-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/60 transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-rose-400/70 mt-1.5 ml-1">
                        Receives a Guardian Alert automatically on Urgent Care results.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WHATSAPP TOAST
══════════════════════════════════════════════════════════════════════ */
function WhatsAppToast({ show, onDismiss }: { show: boolean; onDismiss: () => void }) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 bg-indigo-900/95 border border-indigo-500/40 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-[0_0_30px_rgba(99,102,241,0.35)] cursor-pointer"
          onClick={onDismiss}
        >
          {/* Animated checkmark */}
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 500 }}
            >
              <Check className="h-5 w-5 text-indigo-300" />
            </motion.div>
          </div>
          <div>
            <p className="text-sm font-black text-indigo-100">Synced to WhatsApp</p>
            <p className="text-[11px] text-indigo-400">SBAR report dispatched to your device</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="ml-2 text-indigo-500 hover:text-indigo-300 transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════ */
export default function TriagePage() {
  const [symptoms, setSymptoms]             = useState("");
  const [intensity, setIntensity]           = useState([5]);
  const [loading, setLoading]               = useState(false);
  const [result, setResult]                 = useState<AIResult | null>(null);
  const [error, setError]                   = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const { theme }                           = useTheme();
  const [mounted, setMounted]               = useState(false);
  const [conditions, setConditions]         = useState<string[]>([]);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [emergencyDismissed, setEmergencyDismissed] = useState(false);

  const [medications, setMedications]       = useState<string[]>([]);
  const [medInput, setMedInput]             = useState("");

  const [isListening, setIsListening]       = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef                      = useRef<any>(null);

  // WhatsApp state
  const [waEnabled, setWaEnabled]           = useState(false);
  const [waPhone, setWaPhone]               = useState("");
  const [waEmergency, setWaEmergency]       = useState("");
  const [syncStatus, setSyncStatus]         = useState<SyncStatus>("idle");
  const [showToast, setShowToast]           = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCond  = localStorage.getItem("smart-health-conditions");
    const savedMeds  = localStorage.getItem("smart-health-meds");
    const savedWaOn  = localStorage.getItem("medai-wa-enabled");
    const savedPhone = localStorage.getItem("medai-wa-phone");
    const savedEmer  = localStorage.getItem("medai-wa-emergency");
    if (savedCond)  setConditions(JSON.parse(savedCond));
    if (savedMeds)  setMedications(JSON.parse(savedMeds));
    if (savedWaOn)  setWaEnabled(savedWaOn === "true");
    if (savedPhone) setWaPhone(savedPhone);
    if (savedEmer)  setWaEmergency(savedEmer);

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setVoiceSupported(false);
  }, []);

  useEffect(() => {
    if (result?.recommendation_level === "Urgent Care") {
      setEmergencyDismissed(false);
      navigator.geolocation?.getCurrentPosition(
        (p) => setLocationCoords({ lat: p.coords.latitude, lng: p.coords.longitude }), () => {}
      );
    }
  }, [result]);

  const addTag = (tag: string) => {
    if (!symptoms.includes(tag)) setSymptoms((p) => (p ? `${p}, ${tag}` : tag));
  };

  const handleAddMedication = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ((e.type === "keydown" && (e as React.KeyboardEvent).key === "Enter") || e.type === "click") {
      e.preventDefault();
      if (medInput.trim() && !medications.includes(medInput.trim())) {
        const updated = [...medications, medInput.trim()];
        setMedications(updated);
        localStorage.setItem("smart-health-meds", JSON.stringify(updated));
        setMedInput("");
      }
    }
  };

  const removeMedication = (med: string) => {
    const updated = medications.filter((m) => m !== med);
    setMedications(updated);
    localStorage.setItem("smart-health-meds", JSON.stringify(updated));
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome for voice input."); return; }
    const r: any = new SR();
    recognitionRef.current = r;
    r.lang = "en-IN"; r.continuous = false; r.interimResults = false;
    r.onstart  = () => setIsListening(true);
    r.onend    = () => setIsListening(false);
    r.onerror  = () => setIsListening(false);
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setSymptoms((p) => (p ? `${p}, ${t}` : t));
    };
    r.start();
  };
  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  /* ── Silent WhatsApp dispatch ─────────────────────────────────────── */
  const dispatchWhatsApp = async (data: AIResult) => {
    if (!waEnabled || !waPhone) return;

    const hasDDI = !!(data.medication_warning && data.medication_warning !== "null");
    setSyncStatus("syncing");

    try {
      const res = await fetch("/api/whatsapp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to:            waPhone,
          emergencyTo:   waEmergency || undefined,
          result:        data,
          symptoms,
          hasDDI,
        }),
      });
      if (res.ok) {
        const resData = await res.json();
        
        // WhatsApp Deep Link Fallback if no Twilio keys
        if (!resData.credentialsConfigured && resData.messageBody) {
          const encodedText = encodeURIComponent(resData.messageBody);
          // Launch WhatsApp Web/App with pre-filled message
          setTimeout(() => {
            window.open(`https://wa.me/${waPhone.replace(/\D/g, "")}?text=${encodedText}`, "_blank");
          }, 100);
        }

        setSyncStatus("synced");
        setShowToast(true);
      } else {
        setSyncStatus("idle");
      }
    } catch {
      setSyncStatus("idle");
    }
  };

  /* ── Main analyze handler ─────────────────────────────────────────── */
  const handleAnalyze = async () => {
    if (!symptoms.trim()) { setError("Please describe your symptoms first."); return; }
    setLoading(true); setError(""); setResult(null); setSyncStatus("idle");
    try {
      const res = await fetch("/api/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms:    `${symptoms}. Intensity: ${intensity[0]}/10.`,
          background:  conditions,
          medications,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        const historyItem: TriageHistoryItem = {
          id:          `triage-${Date.now()}`,
          createdAt:   new Date().toISOString(),
          symptoms,
          intensity:   intensity[0],
          background:  conditions,
          medications,
          result:      data as AIResult,
        };
        const existing = JSON.parse(localStorage.getItem("medai-triage-history") || "[]") as TriageHistoryItem[];
        localStorage.setItem("medai-triage-history", JSON.stringify([historyItem, ...existing].slice(0, 50)));

        // 🔔 Silent WhatsApp dispatch — zero click, fires immediately after result
        await dispatchWhatsApp(data as AIResult);
      } else throw new Error();
    } catch { setError("Analysis failed. Please try again."); }
    finally   { setLoading(false); }
  };

  const mapsLink = locationCoords
    ? `https://www.google.com/maps/search/emergency+hospital/@${locationCoords.lat},${locationCoords.lng},14z`
    : "https://www.google.com/maps/search/emergency+hospital+near+me";
  const isUrgent = result?.recommendation_level === "Urgent Care" && !emergencyDismissed;

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans selection:bg-indigo-400/20 selection:text-white ${isUrgent ? "bg-[#2a0b12]" : "bg-transparent"}`}>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">

          {/* ── LEFT COLUMN: INPUTS ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

            {/* SYMPTOMS CARD */}
            <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-6 shadow-[0_0_30px_rgba(14,165,233,0.12)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sm font-black text-sky-600 dark:text-sky-400 flex items-center justify-center">1</div>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">Intake Form</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SYMPTOMS.slice(0, 3).map((s) => (
                    <button key={s} onClick={() => addTag(s)} className="text-xs border border-white/10 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 hover:bg-white/10 text-slate-200">
                      <Plus className="h-3 w-3" /> {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Describe exactly how you're feeling..."
                  className="min-h-[140px] text-lg p-5 pr-14 rounded-2xl bg-black/40 border-white/10 text-white"
                  value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
                />
                <Button
                  size="icon" variant="ghost" disabled={!voiceSupported}
                  className={`absolute bottom-3 right-3 transition-all rounded-full w-10 h-10 ${
                    isListening ? "text-red-500 bg-red-950/60 animate-pulse" : "text-sky-300 hover:bg-sky-950"
                  }`}
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* MED-SAFE PHARMACIST CARD */}
            <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-6 shadow-[0_0_30px_rgba(14,165,233,0.12)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 text-sm font-black text-violet-600 dark:text-violet-400 flex items-center justify-center">2</div>
                <span className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">Medications (Med-Safe)</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Aspirin, Warfarin, Lisinopril..."
                  value={medInput}
                  onChange={(e) => setMedInput(e.target.value)}
                  onKeyDown={handleAddMedication}
                  className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <Button onClick={handleAddMedication} className="bg-[#0ea5e9] hover:bg-sky-400 text-[#03111b] rounded-xl px-6">Add</Button>
              </div>
              {medications.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {medications.map((med) => (
                    <span key={med} className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 text-sky-200 text-xs font-bold px-3 py-1.5 rounded-lg">
                      <Pill className="h-3 w-3" /> {med}
                      <button onClick={() => removeMedication(med)} className="hover:text-red-500 ml-1">✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ WHATSAPP MED-SAFE SYNC CARD — above the triage button */}
            <WhatsAppSyncCard
              enabled={waEnabled}
              onToggle={() => {
                const next = !waEnabled;
                setWaEnabled(next);
                localStorage.setItem("medai-wa-enabled", String(next));
              }}
              phoneNumber={waPhone}
              onPhoneChange={setWaPhone}
              emergencyContact={waEmergency}
              onEmergencyChange={setWaEmergency}
              syncStatus={syncStatus}
            />

            {/* ACTION BUTTON */}
            <div className="relative">
              <motion.button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-6 rounded-3xl font-black text-xl text-[#03111b] shadow-[0_0_30px_rgba(14,165,233,0.35)] bg-[#0ea5e9] hover:bg-sky-400 disabled:opacity-70 flex justify-center items-center gap-3"
              >
                {loading ? <span className="animate-pulse">Analyzing with 4 Agents...</span> : <><Activity className="h-6 w-6" /> Initiate AI Triage</>}
              </motion.button>

              {/* Inline sync status below button */}
              <AnimatePresence>
                {syncStatus === "syncing" && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute -bottom-7 left-0 right-0 flex justify-center"
                  >
                    <span className="flex items-center gap-1.5 text-xs text-indigo-300 font-bold">
                      <RefreshCcw className="h-3 w-3 animate-spin" />
                      Syncing to Cloud...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-semibold text-center -mt-2">{error}</p>
            )}

          </motion.div>

          {/* ── RIGHT COLUMN: RESULTS ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

            {/* SKELETON LOADERS */}
            {loading && (
              <div className="space-y-4">
                {["Cardiologist", "Neurologist", "General Practitioner", "CMO Synthesizing..."].map((label, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                    className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-3 bg-slate-200 dark:bg-white/10 rounded animate-pulse w-1/3" />
                      <div className="h-2 bg-slate-100 dark:bg-white/5 rounded animate-pulse w-3/4" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* IDLE STATE */}
            {!loading && !result && (
              <div className="bg-white dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/[0.1] rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[500px] shadow-sm">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-white/5">
                  <Shield className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Awaiting Symptoms</h3>
                <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm mb-8">
                  Fill out the intake form. Our Multi-Agent AI will analyze your data and provide an instant, hospital-grade triage report.
                </p>
              </div>
            )}

            {/* RESULTS STATE */}
            <AnimatePresence>
              {result && !loading && (
                <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">

                  {/* PHARMACIST WARNING BANNER */}
                  {result.medication_warning && result.medication_warning !== "null" && (
                    <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-500 rounded-3xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500 animate-pulse" />
                        <h3 className="font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Pharmacist Alert (Drug Interaction)</h3>
                      </div>
                      <p className="text-red-800 dark:text-red-300 font-medium leading-relaxed">{result.medication_warning}</p>
                    </div>
                  )}

                  {/* URGENT CARE PROTOCOL */}
                  {isUrgent && (
                    <motion.div initial={{ y: 10 }} animate={{ y: 0 }} className="bg-red-50 dark:bg-red-500/10 border-2 border-red-500 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-red-500/20">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-2xl">
                            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 animate-pulse" />
                          </div>
                          <div>
                            <h2 className="font-black text-red-700 dark:text-red-300 text-2xl uppercase tracking-tight">Critical Alert</h2>
                            <p className="text-red-600/80 dark:text-red-400/80 font-bold text-sm">Immediate action required</p>
                          </div>
                        </div>
                        <button onClick={() => setEmergencyDismissed(true)} className="text-red-400 hover:text-red-600 transition-colors">
                          <XCircle className="h-6 w-6" />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <a href="tel:112" className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black text-lg py-4 rounded-2xl transition-all active:scale-95">
                          <PhoneCall className="h-5 w-5 animate-bounce" /> Dial 112
                        </a>
                        <a href={mapsLink} target="_blank" className="flex items-center justify-center gap-3 bg-white dark:bg-red-950/50 hover:bg-slate-50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-bold text-lg py-4 rounded-2xl transition-all active:scale-95">
                          <MapPin className="h-5 w-5" /> Locate ER
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* TRIAGE LEVEL BADGE */}
                  <div className={`flex items-center justify-between p-5 rounded-3xl border shadow-sm ${
                    result.recommendation_level === "Urgent Care"     ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300" :
                    result.recommendation_level === "Consult Doctor"  ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300" :
                    "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  }`}>
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Final Consensus</p>
                        <p className="text-xl font-bold">{result.recommendation_level}</p>
                      </div>
                    </div>
                    <Button onClick={() => window.print()} variant="outline" className="bg-white/50 dark:bg-white/5 border-current hover:bg-white dark:hover:bg-white/10 text-inherit font-bold">
                      <FileText className="h-4 w-4 mr-2" /> Export SBAR
                    </Button>
                  </div>

                  {/* AGENT DEBATE GRID */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                      <Users className="h-4 w-4" /> Medical Board Insights
                    </p>
                    {result.specialist_debate?.map((agent, i) => {
                      const meta = AGENT_META[agent.role] || AGENT_META["General Practitioner"];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          className={`rounded-2xl p-5 border shadow-sm backdrop-blur-sm ${theme === "dark" ? meta.darkBg : meta.lightBg}`}>
                          <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2 ${theme === "dark" ? meta.darkColor : meta.lightColor}`}>
                            {meta.icon} {agent.role}
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{agent.insight}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* CLINICAL FINDINGS */}
                  <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm">
                    <div className="mb-8">
                      <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Potential Conditions</p>
                      <div className="flex flex-wrap gap-2.5">
                        {result.possible_conditions.map((c, i) => (
                          <button onClick={() => setSelectedCondition(c)} key={i} className="text-sm px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold shadow-sm hover:scale-[1.02] transition">
                            {c}
                          </button>
                        ))}
                      </div>
                      {selectedCondition && (
                        <div className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
                          <p className="text-xs uppercase tracking-widest font-black text-sky-300">Condition Insight</p>
                          <p className="mt-2 text-sm text-slate-100">
                            {CONDITION_DETAILS[selectedCondition] || `${selectedCondition}: Potential condition flagged by AI triage. Clinical confirmation is required.`}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Action Plan</p>
                      <ul className="space-y-3">
                        {result.precautions.map((p, i) => (
                          <li key={i} className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5">
                            <span className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                              {i + 1}
                            </span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      </main>

      {/* ─── PRINT VIEW ─── */}
      <div className="hidden print:block p-8 font-serif text-black bg-white">
        <h1 className="text-3xl font-bold border-b-2 border-black pb-4 mb-6">Clinical Triage Report (SBAR)</h1>
        <div className="space-y-6">
          <div><h2 className="text-xl font-bold">Situation</h2><p className="text-lg italic mt-2">{symptoms}</p></div>
          <div><h2 className="text-xl font-bold">Background</h2><p className="text-lg mt-2">Conditions: {conditions.join(", ") || "None"}</p></div>
          <div><h2 className="text-xl font-bold">Assessment</h2><ul className="list-disc pl-6 text-lg mt-2">{result?.possible_conditions.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
          <div><h2 className="text-xl font-bold">Recommendation</h2><p className="text-lg font-bold uppercase mt-2">{result?.recommendation_level}</p><ul className="list-disc pl-6 text-lg mt-2">{result?.precautions.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
        </div>
      </div>

      {/* ─── WHATSAPP TOAST ─── */}
      <WhatsAppToast show={showToast} onDismiss={() => setShowToast(false)} />

    </div>
  );
}
