"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind, MapPin, Thermometer, Droplets, AlertTriangle,
  Sun, CloudRain, Loader2, Navigation, Heart, HardHat,
  ArrowLeft, Search
} from "lucide-react";
import Link from "next/link";

interface AqiData {
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    precipitation: number;
    weatherCode: number;
  };
  aqi: { value: number | string; dominantPollutant: string };
  advisory: {
    general: string;
    asthma: string;
    outdoorWorker: string;
    aqiSeverity: "Good" | "Moderate" | "Poor" | "Severe";
  };
  locationName?: string;
}

const severityConfig = {
  Good: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500", icon: "🟢" },
  Moderate: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500", icon: "🟡" },
  Poor: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", badge: "bg-orange-500", icon: "🟠" },
  Severe: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500", icon: "🔴" },
};

export default function AqiPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AqiData | null>(null);
  const [error, setError] = useState("");
  const [locationStr, setLocationStr] = useState("");

  const fetchAqi = async () => {
    if (!locationStr.trim()) {
      setError("Please enter a city or location.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/aqi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: locationStr }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch AQI");
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to fetch AQI data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const severity = data?.advisory?.aqiSeverity || "Good";
  const config = severityConfig[severity] || severityConfig["Good"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patient"
          className="p-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
          <ArrowLeft className="h-4 w-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Air Quality & Weather Advisory</h1>
          <p className="text-slate-400 text-sm mt-0.5">Real-time AQI and health recommendations</p>
        </div>
      </div>

      {/* Input Section */}
      {!data && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-transparent p-10 flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
            <MapPin className="h-10 w-10 text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white mb-2">Check Local Air Quality</h2>
            <p className="text-slate-400 text-sm max-w-md">
              Enter your city to get live AQI, weather, and personalized AI health advisories.
            </p>
          </div>
          
          <div className="w-full max-w-md">
            <div className="relative">
              <input 
                type="text"
                value={locationStr}
                onChange={e => setLocationStr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchAqi()}
                placeholder="e.g. New Delhi, Mumbai, New York..."
                className="w-full bg-black/40 border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-500"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <button onClick={fetchAqi}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-black text-sm transition-all shadow-lg shadow-sky-500/20">
            <Navigation className="h-5 w-5" />
            Check Air Quality
          </button>
          
          {error && (
            <p className="text-red-400 text-xs font-medium flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> {error}
            </p>
          )}
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-10 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-sky-400 animate-spin" />
          <p className="text-slate-300 font-bold">Scanning Web for AQI Data...</p>
          <p className="text-slate-500 text-xs">Analyzing location data using Firecrawl AI</p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {data && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* AQI Hero */}
            <div className={`rounded-3xl border ${config.border} ${config.bg} p-8`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Air Quality in {data.locationName || locationStr}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-white">{data.aqi.value}</span>
                    <span className={`text-lg font-black ${config.text}`}>{severity}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Dominant Pollutant: <span className="text-slate-300 font-bold">{data.aqi.dominantPollutant}</span></p>
                </div>
                <div className={`w-20 h-20 rounded-3xl ${config.badge}/20 border ${config.border} flex items-center justify-center text-4xl`}>
                  {config.icon}
                </div>
              </div>

              {/* AQI Scale */}
              <div className="relative h-3 rounded-full overflow-hidden bg-white/5">
                <div className="absolute inset-0 flex">
                  <div className="flex-1 bg-emerald-500/40" />
                  <div className="flex-1 bg-amber-500/40" />
                  <div className="flex-1 bg-orange-500/40" />
                  <div className="flex-1 bg-red-500/40" />
                </div>
                <motion.div
                  initial={{ left: "0%" }}
                  animate={{ left: `${Math.min((Number(data.aqi.value) / 300) * 100, 100)}%` }}
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-slate-900"
                  style={{ marginLeft: "-8px" }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-600 mt-1 font-bold">
                <span>Good</span><span>Moderate</span><span>Poor</span><span>Severe</span>
              </div>
            </div>

            {/* Weather Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Thermometer className="h-3.5 w-3.5" />, label: "Temperature", value: `${data.weather.temperature}°C`, sub: `Feels ${data.weather.feelsLike}°C`, color: "text-orange-400 border-orange-500/20 bg-orange-500/5" },
                { icon: <Droplets className="h-3.5 w-3.5" />, label: "Humidity", value: `${data.weather.humidity}%`, sub: "Relative", color: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
                { icon: <Wind className="h-3.5 w-3.5" />, label: "Wind", value: `${data.weather.windSpeed}`, sub: "km/h", color: "text-teal-400 border-teal-500/20 bg-teal-500/5" },
                { icon: <CloudRain className="h-3.5 w-3.5" />, label: "Rain", value: `${data.weather.precipitation}`, sub: "mm", color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" },
              ].map(m => (
                <div key={m.label} className={`rounded-2xl border p-4 ${m.color}`}>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest mb-2 opacity-80">{m.icon}{m.label}</div>
                  <p className="text-2xl font-black text-white">{m.value}</p>
                  <p className="text-xs text-slate-500">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* AI Advisory Cards */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">🤖 AI Health Advisory</p>

              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-sky-300">General Advice</span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{data.advisory.general}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-rose-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-rose-300">Asthma Warning</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{data.advisory.asthma}</p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <HardHat className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-amber-300">Outdoor Workers</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{data.advisory.outdoorWorker}</p>
                </div>
              </div>
            </div>

            {/* Refresh */}
            <div className="flex justify-center">
              <button onClick={() => { setData(null); setLocationStr(""); }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:border-sky-500/30 font-bold text-sm transition-all">
                <Search className="h-4 w-4" /> Search New Location
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
