"use client";

import { useMemo, useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Phone, User, HeartPulse, ArrowLeft, Share2, ScanLine } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PassportPage() {
  const [conditions, setConditions] = useState<string[]>([]);
  const [meds, setMeds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("Demo Patient");

  useEffect(() => {
    setMounted(true);
    setConditions(JSON.parse(localStorage.getItem("smart-health-conditions") || "[]"));
    setMeds(JSON.parse(localStorage.getItem("smart-health-meds") || "[]"));
    setUserName(localStorage.getItem("smart-health-name") || "Demo Patient");
  }, []);

  const emergencyContact = "112 (Emergency)";

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/dashboard/reception?medai=${encodeURIComponent(
      btoa(JSON.stringify({ name: userName, conditions, medications: meds }))
    )}`;
  }, [conditions, meds, userName]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#030712] p-4 md:p-8 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full space-y-6">
        
        {/* Navigation */}
        <Link href="/">
          <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 mb-2 -ml-2 rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit
          </Button>
        </Link>

        {/* The Digital Passport Card - Apple Wallet Style */}
        <motion.div 
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative bg-gradient-to-b from-slate-900 to-black rounded-[2.5rem] p-1 shadow-2xl overflow-hidden border border-white/10"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
          
          <div className="relative bg-[#070b14] rounded-[2.35rem] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500/10 to-transparent p-6 pb-8 border-b border-white/5">
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <ShieldAlert className="h-6 w-6 text-red-500" />
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Status</p>
                  <p className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
                  </p>
                </div>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">MedID Card</h1>
              <p className="text-red-400/80 text-xs font-bold uppercase tracking-widest">Emergency Medical Access</p>
            </div>

            {/* QR Code Section */}
            <div className="p-8 flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              
              <div className="relative group">
                <div className="absolute -inset-4 bg-white/5 rounded-[2rem] blur-xl group-hover:bg-white/10 transition-colors duration-500" />
                <div className="p-4 rounded-3xl bg-white shadow-[0_0_40px_rgba(255,255,255,0.1)] relative transition-transform duration-500 group-hover:scale-105">
                  <QRCode 
                    value={shareUrl} 
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                    fgColor="#000000"
                  />
                  {/* Scanner overlay line animation */}
                  <motion.div 
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10"
                  />
                </div>
              </div>
              
              <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-8 flex items-center gap-2">
                <ScanLine className="h-4 w-4" /> EMS Scan Point
              </p>
            </div>

            {/* Critical Info Grid */}
            <div className="p-6 pt-0 space-y-3">
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 backdrop-blur-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Patient Identity</p>
                  <p className="text-base font-bold text-slate-200">{userName}</p>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 backdrop-blur-sm flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <HeartPulse className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Critical Flags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {conditions.length > 0 ? (
                      conditions.map(c => <span key={c} className="text-[10px] font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-md">{c}</span>)
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Clear / None reported</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-red-500/70 uppercase tracking-widest">ICE Protocol</p>
                  <p className="text-sm font-bold text-red-400">{emergencyContact}</p>
                </div>
              </div>
            </div>

            <div className="p-6 pt-2">
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-white/10 shadow-xl rounded-2xl py-6 text-sm font-bold flex items-center gap-2 transition-all active:scale-95">
                <Share2 className="h-4 w-4" /> Add to Digital Wallet
              </Button>
            </div>
            
          </div>
        </motion.div>

        <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          Encrypted • Hospital Systems only
        </p>
      </div>
    </main>
  );
}