"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, FileText, Download, Clipboard, ClipboardCheck, RefreshCw } from "lucide-react";

interface ScribeNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  summary: string;
}

export default function DoctorDashboard() {
  const [transcript, setTranscript] = useState("");
  const [note, setNote] = useState<ScribeNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome for voice input."); return; }
    const r = new SR();
    recognitionRef.current = r;
    r.lang = "en-IN"; r.continuous = true; r.interimResults = true;
    r.onstart = () => setIsListening(true);
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setTranscript((p) => p + final || interim);
    };
    r.start();
  };
  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const handleGenerate = async () => {
    if (!transcript.trim()) { setError("Please provide a transcript first."); return; }
    setLoading(true); setError(""); setNote(null);
    try {
      const res = await fetch("/api/scribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json() as ScribeNote;
      if (res.ok) setNote(data);
      else throw new Error();
    } catch { setError("Failed to generate note. Please try again."); }
    finally { setLoading(false); }
  };

  const copyNote = () => {
    if (!note) return;
    const text = `SOAP NOTE\n\nSubjective: ${note.subjective}\n\nObjective: ${note.objective}\n\nAssessment: ${note.assessment}\n\nPlan: ${note.plan}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadNote = () => {
    if (!note) return;
    const text = `SOAP NOTE\nDate: ${new Date().toLocaleDateString()}\n\nSummary: ${note.summary}\n\nSubjective:\n${note.subjective}\n\nObjective:\n${note.objective}\n\nAssessment:\n${note.assessment}\n\nPlan:\n${note.plan}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `soap-note-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const FIELDS: { key: keyof ScribeNote; label: string; color: string }[] = [
    { key: "subjective", label: "S — Subjective", color: "border-sky-500/30 bg-sky-500/5" },
    { key: "objective", label: "O — Objective", color: "border-violet-500/30 bg-violet-500/5" },
    { key: "assessment", label: "A — Assessment", color: "border-amber-500/30 bg-amber-500/5" },
    { key: "plan", label: "P — Plan", color: "border-emerald-500/30 bg-emerald-500/5" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">AI Clinical Scribe</h1>
        <p className="text-slate-400 mt-1">Speak or type a patient encounter — get an instant SOAP note.</p>
      </div>

      {/* Transcript input */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-black uppercase tracking-widest text-slate-300">Encounter Transcript</span>
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isListening
                ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                : "bg-white/5 text-slate-300 border border-white/10 hover:border-sky-500/30 hover:text-sky-400"
            }`}
          >
            {isListening ? <><MicOff className="h-4 w-4" /> Stop Recording</> : <><Mic className="h-4 w-4" /> Voice Record</>}
          </button>
        </div>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Speak or type the doctor-patient conversation here...&#10;&#10;Example: 'Patient is a 45-year-old male presenting with chest pain for 2 hours. Pain radiates to left arm. BP 140/90. Heart rate 88. Patient denies shortness of breath...'"
          className="w-full h-40 bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm leading-relaxed resize-none focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-600"
        />
        {error && <p className="text-red-400 text-sm mt-2 font-medium">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={handleGenerate} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-black font-black transition-all">
            {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating Note...</> : <><FileText className="h-4 w-4" /> Generate SOAP Note</>}
          </button>
          {note && (
            <>
              <button onClick={copyNote} title="Copy note"
                className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all">
                {copied ? <ClipboardCheck className="h-5 w-5 text-emerald-400" /> : <Clipboard className="h-5 w-5" />}
              </button>
              <button onClick={downloadNote} title="Download note"
                className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all">
                <Download className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading skeleons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key} className={`rounded-2xl border p-5 ${f.color}`}>
              <div className="h-3 bg-white/10 rounded animate-pulse w-1/3 mb-3" />
              <div className="space-y-2">
                <div className="h-2.5 bg-white/5 rounded animate-pulse w-full" />
                <div className="h-2.5 bg-white/5 rounded animate-pulse w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SOAP Note Results */}
      <AnimatePresence>
        {note && !loading && (
          <motion.div key="note" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {note.summary && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Encounter Summary</p>
                  <p className="text-slate-200 font-medium">{note.summary}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.map((f, i) => (
                <motion.div key={f.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border p-5 ${f.color}`}>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{f.label}</p>
                  <p className="text-slate-200 text-sm leading-relaxed">{note[f.key]}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
