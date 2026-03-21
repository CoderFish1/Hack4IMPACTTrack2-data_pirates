"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, ArrowLeft, Loader2, AlertCircle, X, FileImage } from "lucide-react";
import Link from "next/link";

export default function ReportExplainerPage() {
  const [base64, setBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }
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
        setBase64(dataUrl);
        setPreview(dataUrl);
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const analyze = async () => {
    if (!base64) return;
    setLoading(true); setError(""); setMarkdown("");
    try {
      const res = await fetch("/api/report-explainer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64 }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMarkdown(data.explanation || data.markdown || "Unable to analyze.");
    } catch { setError("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  };

  const reset = () => { setBase64(null); setPreview(null); setMarkdown(""); setError(""); };

  const renderMd = (md: string) => md
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-black text-white mt-5 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-black text-white mt-6 mb-3 pb-2 border-b border-white/10">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-black text-white mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/^- (.*$)/gm, '<li class="text-slate-300 text-sm leading-relaxed ml-4 mb-1.5 list-disc">$1</li>')
    .replace(/\n\n/g, '<br/>');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patient" className="p-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
          <ArrowLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Medical Report Explainer</h1>
          <p className="text-slate-400 text-sm mt-0.5">Upload a lab report — AI explains it in simple language</p>
        </div>
      </div>

      {!preview && !markdown && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`rounded-3xl border-2 border-dashed transition-all p-14 flex flex-col items-center gap-5 cursor-pointer ${
            dragging ? "border-sky-500/60 bg-sky-500/10" : "border-white/10 bg-white/[0.02] hover:border-sky-500/30"
          }`}>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
          <div className="w-20 h-20 rounded-3xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
            <Upload className="h-10 w-10 text-sky-400" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-black text-white mb-1">Drop your lab report here</h2>
            <p className="text-slate-400 text-sm">or click to browse — JPG, PNG (max 20MB)</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <FileImage className="h-3.5 w-3.5" /> Blood Tests • CBC • Lipid Panel • LFT • KFT
          </div>
        </motion.div>
      )}

      {preview && !markdown && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-sky-400" />
              <span className="text-sm font-black uppercase tracking-widest text-sky-300/90">Preview</span>
            </div>
            <button onClick={reset} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 max-h-[400px] flex items-center justify-center">
            <img src={preview} alt="Report" className="max-h-[400px] object-contain" />
          </div>
          <button onClick={analyze}
            className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-black text-sm flex items-center justify-center gap-2 transition-all">
            <FileText className="h-5 w-5" /> Analyze Report with AI
          </button>
          {error && <p className="text-red-400 text-xs font-medium flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}
        </motion.div>
      )}

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-10 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-sky-400 animate-spin" />
          <p className="text-slate-300 font-bold">Reading your lab report...</p>
          <div className="w-full max-w-lg space-y-3 mt-4">
            {[...Array(5)].map((_, i) => <div key={i} className={`h-4 bg-white/5 rounded animate-pulse ${i % 2 ? "w-full" : "w-3/4"}`} />)}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {markdown && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-3xl border border-sky-500/20 bg-white/[0.02] p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-5 w-5 text-sky-400" />
                <span className="text-sm font-black uppercase tracking-widest text-sky-300/90">AI Analysis</span>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMd(markdown) }} />
            </div>
            <div className="flex justify-center">
              <button onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white font-bold text-sm transition-all">
                <Upload className="h-4 w-4" /> Upload Another Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
