"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Globe, RefreshCw, ShieldAlert, TrendingUp, Info, Droplets } from "lucide-react";

interface EpidemicAlert { disease: string; risk: "Low" | "Medium" | "High"; region: string; note: string; }
interface BloodStock { type: string; units: number; status: "Low" | "Medium" | "High" | "Critical"; }
interface EpidemicData {
  hospital_name: string;
  overall_risk: "Low" | "Medium" | "High";
  alerts: EpidemicAlert[];
  recommendation: string;
  blood_inventory: BloodStock[];
  last_updated: string;
}

const riskMeta = {
  High: { color: "text-red-400 bg-red-500/10 border-red-500/30", bg: "bg-red-500/5", dot: "bg-red-400" },
  Medium: { color: "text-amber-400 bg-amber-500/10 border-amber-500/30", bg: "bg-amber-500/5", dot: "bg-amber-400" },
  Low: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", bg: "bg-emerald-500/5", dot: "bg-emerald-400" },
};

function BloodInventory({ data, loading, error }: { data: EpidemicData | null; loading: boolean; error: string }) {
  const statusStyle = {
    High: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    Low: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    Critical: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  const inventory = data?.blood_inventory || [];
  const critical = inventory.filter(b => b.status === "Critical");

  return (
    <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Droplets className="h-5 w-5 text-red-400" />
        <span className="text-sm font-black uppercase tracking-widest text-red-300/90">Blood Bank Inventory</span>
        <span className="ml-auto text-[10px] text-red-300 font-bold">{data?.hospital_name || "Regional Hospital"}</span>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex items-center gap-3 text-red-400 mb-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {critical.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 mb-4 text-xs text-red-300">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 animate-pulse" />
              <span>Critical shortage: <strong>{critical.map(b => b.type).join(", ")}</strong> — Request emergency supply</span>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {inventory.map(item => (
              <div key={item.type} className={`rounded-2xl border p-3 text-center ${statusStyle[item.status]}`}>
                <p className="text-base font-black text-white">{item.type}</p>
                <p className="text-lg font-black mt-0.5">{item.units}</p>
                <p className="text-[10px] font-bold opacity-80 mt-0.5">units</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />Adequate
          <span className="w-2 h-2 rounded-full bg-amber-400 ml-2" />Low
          <span className="w-2 h-2 rounded-full bg-red-500 ml-2" />Critical
        </span>
        <span>Updated 15 min ago</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<EpidemicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/epidemic");
      const json = await res.json() as EpidemicData;
      setData(json);
    } catch {
      setError("Failed to fetch epidemic data. Please retry.");
    } finally { setLoading(false); }
  };

  const overall = data ? riskMeta[data.overall_risk] : riskMeta.Low;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Hospital Admin Console</h1>
          <p className="text-slate-400 mt-1">AI-powered disease intelligence and hospital resource management.</p>
        </div>
        <button onClick={loadData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Blood Bank Inventory */}
      <BloodInventory data={data} loading={loading} error={error} />

      {/* Epidemic Radar */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Epidemic Radar</h2>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex items-center gap-3 text-red-400">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] h-32 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] h-20 animate-pulse" />
              ))}
            </motion.div>
          ) : data ? (
            <motion.div key="data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Overall Risk Banner */}
              <div className={`rounded-3xl border p-6 ${overall.bg} border-white/10`}>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${riskMeta[data.overall_risk].color}`}>
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Overall Epidemic Risk</p>
                    <div className="flex items-center gap-3 mt-1">
                      <h2 className="text-3xl font-black text-white">{data.overall_risk}</h2>
                      <span className={`w-3 h-3 rounded-full animate-pulse ${overall.dot}`} />
                    </div>
                    {data.last_updated && (
                      <p className="text-xs text-slate-500 mt-1">Last updated: {data.last_updated}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Alert Cards */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Active Disease Alerts</p>
                </div>
                <div className="space-y-3">
                  {data.alerts.map((alert, i) => {
                    const meta = riskMeta[alert.risk] || riskMeta.Low;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                            <Globe className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white">{alert.disease}</h3>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${meta.color}`}>{alert.risk}</span>
                            </div>
                            <p className="text-slate-400 text-xs font-medium mt-0.5">{alert.region}</p>
                            <p className="text-slate-300 text-sm mt-2">{alert.note}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation */}
              {data.recommendation && (
                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 flex items-start gap-4">
                  <Info className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-sky-400 mb-2">Hospital Recommendation</p>
                    <p className="text-slate-200 leading-relaxed">{data.recommendation}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
