"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowLeft, Loader2, AlertCircle, RefreshCw, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function ReportExplainerPage() {
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image for OCR."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Max 10MB."); return; }
    setError("");
    setExtracting(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

        try {
          const res = await fetch("/api/ocr", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64Image: dataUrl })
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error);
          setReportText(prev => prev + (prev ? "\n" : "") + json.text);
        } catch {
          setError("Failed to extract text from image.");
        } finally {
          setExtracting(false);
        }
      };
      if (typeof event.target?.result === "string") img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const analyze = async () => {
    if (!reportText.trim()) { setError("Please paste your report text first."); return; }
    setLoading(true); setError(""); setMarkdown("");
    try {
      const res = await fetch("/api/report-explainer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMarkdown(data.explanation || "Unable to analyze.");
    } catch { setError("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  };

  const reset = () => { setReportText(""); setMarkdown(""); setError(""); };

  const renderMd = (md: string) => md
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-black text-slate-900 dark:text-white mt-5 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-black text-slate-900 dark:text-white mt-6 mb-3 pb-2 border-b border-black/10 dark:border-white/10">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-black text-slate-900 dark:text-white mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-600 dark:text-slate-300">$1</em>')
    .replace(/^- (.*$)/gm, '<li class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed ml-4 mb-1.5 list-disc">$1</li>')
    .replace(/\n\n/g, '<br/>');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patient" className="p-2 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors shadow-sm dark:shadow-none">
          <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Medical Report Explainer</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Upload a photo or paste a lab report for AI analysis</p>
        </div>
      </div>

      {!markdown && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-3xl border border-sky-500/20 bg-sky-50 dark:bg-sky-500/5 p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                <span className="text-sm font-black uppercase tracking-widest text-sky-600 dark:text-sky-300/90">Lab Report Text</span>
              </div>
              <button 
                onClick={() => inputRef.current?.click()} 
                disabled={extracting}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-xs rounded-xl hover:bg-sky-50 dark:hover:bg-sky-500/20 transition-all shadow-sm dark:shadow-none disabled:opacity-50"
              >
                {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {extracting ? "Extracting Text..." : "Scan Photo (OCR)"}
              </button>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && processFile(e.target.files[0])} />
            </div>

            <textarea
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              placeholder="Paste the text of your blood test, MRI, or clinical notes here... Or click 'Scan Photo' above to extract text from an image."
              className="w-full h-64 bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl p-5 text-sm focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none shadow-sm dark:shadow-none"
            />
            
            {error && <p className="text-red-500 dark:text-red-400 text-xs font-medium flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}
            
            <button onClick={analyze} disabled={extracting}
              className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 dark:hover:bg-sky-400 text-white dark:text-black font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md dark:shadow-lg dark:shadow-sky-500/20 disabled:opacity-50">
              <FileText className="h-5 w-5" /> Analyze Report with AI
            </button>
          </div>
        </motion.div>
      )}

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-3xl border border-sky-500/20 bg-sky-50 dark:bg-sky-500/5 p-10 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-sky-500 dark:text-sky-400 animate-spin" />
          <p className="text-slate-900 dark:text-slate-300 font-bold">Reading your lab report...</p>
          <div className="w-full max-w-lg space-y-3 mt-4">
            {[...Array(5)].map((_, i) => <div key={i} className={`h-4 bg-black/5 dark:bg-white/5 rounded animate-pulse ${i % 2 ? "w-full" : "w-3/4"}`} />)}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {markdown && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-3xl border border-sky-500/20 bg-white dark:bg-white/[0.02] p-8 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                <span className="text-sm font-black uppercase tracking-widest text-sky-600 dark:text-sky-300/90">AI Analysis</span>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMd(markdown) }} />
            </div>
            <div className="flex justify-center mt-8">
              <button onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-bold text-sm transition-all shadow-sm dark:shadow-none">
                <RefreshCw className="h-4 w-4" /> Analyze Another Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
