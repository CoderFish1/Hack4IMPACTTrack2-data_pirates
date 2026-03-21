"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BodyPart {
  id: string;
  label: string;
  shape: "ellipse" | "rect" | "roundRect";
  x: number; y: number; w: number; h: number;
  rx?: number; ry?: number;
  gradient?: string;
  shadowOffset?: number;
}

const BODY_PARTS: BodyPart[] = [
  // Head
  { id: "head",           label: "Head",          shape: "ellipse",    x: 100, y: 28,  w: 34, h: 34, gradient: "head" },
  // Neck
  { id: "neck",           label: "Neck",          shape: "roundRect",  x: 88,  y: 63,  w: 24, h: 14, rx: 5 },
  // Chest
  { id: "chest",          label: "Chest",         shape: "roundRect",  x: 58,  y: 78,  w: 84, h: 52, rx: 12, gradient: "torso" },
  // Shoulders
  { id: "l-shoulder",     label: "L Shoulder",    shape: "ellipse",    x: 36,  y: 82,  w: 28, h: 22 },
  { id: "r-shoulder",     label: "R Shoulder",    shape: "ellipse",    x: 136, y: 82,  w: 28, h: 22 },
  // Upper Arms
  { id: "l-upper-arm",    label: "L Upper Arm",   shape: "roundRect",  x: 26,  y: 104, w: 20, h: 38, rx: 8 },
  { id: "r-upper-arm",    label: "R Upper Arm",   shape: "roundRect",  x: 154, y: 104, w: 20, h: 38, rx: 8 },
  // Elbows
  { id: "l-elbow",        label: "L Elbow",       shape: "ellipse",    x: 29,  y: 143, w: 18, h: 14 },
  { id: "r-elbow",        label: "R Elbow",       shape: "ellipse",    x: 153, y: 143, w: 18, h: 14 },
  // Forearms
  { id: "l-forearm",      label: "L Forearm",     shape: "roundRect",  x: 27,  y: 156, w: 18, h: 34, rx: 7 },
  { id: "r-forearm",      label: "R Forearm",     shape: "roundRect",  x: 155, y: 156, w: 18, h: 34, rx: 7 },
  // Hands
  { id: "l-hand",         label: "L Hand",        shape: "roundRect",  x: 22,  y: 191, w: 24, h: 20, rx: 6 },
  { id: "r-hand",         label: "R Hand",        shape: "roundRect",  x: 154, y: 191, w: 24, h: 20, rx: 6 },
  // Abdomen
  { id: "abdomen",        label: "Abdomen",       shape: "roundRect",  x: 63,  y: 131, w: 74, h: 40, rx: 10, gradient: "torso" },
  // Pelvis
  { id: "pelvis",         label: "Pelvis",        shape: "roundRect",  x: 60,  y: 172, w: 80, h: 28, rx: 10 },
  // Upper legs
  { id: "l-thigh",        label: "L Thigh",       shape: "roundRect",  x: 62,  y: 202, w: 34, h: 52, rx: 10 },
  { id: "r-thigh",        label: "R Thigh",       shape: "roundRect",  x: 104, y: 202, w: 34, h: 52, rx: 10 },
  // Knees
  { id: "l-knee",         label: "L Knee",        shape: "ellipse",    x: 66,  y: 255, w: 28, h: 18 },
  { id: "r-knee",         label: "R Knee",        shape: "ellipse",    x: 106, y: 255, w: 28, h: 18 },
  // Lower legs
  { id: "l-shin",         label: "L Shin",        shape: "roundRect",  x: 64,  y: 274, w: 30, h: 50, rx: 9 },
  { id: "r-shin",         label: "R Shin",        shape: "roundRect",  x: 106, y: 274, w: 30, h: 50, rx: 9 },
  // Feet
  { id: "l-foot",         label: "L Foot",        shape: "roundRect",  x: 58,  y: 325, w: 38, h: 16, rx: 6 },
  { id: "r-foot",         label: "R Foot",        shape: "roundRect",  x: 104, y: 325, w: 38, h: 16, rx: 6 },
];

function getPainStyle(level: number) {
  if (level === 0) return { fill: "#1e2d3d", stroke: "#2a4060", glow: "none", label: "" };
  if (level <= 3)  return { fill: "#052e16", stroke: "#16a34a", glow: "0 0 12px rgba(34,197,94,0.6)",  label: "Mild" };
  if (level <= 6)  return { fill: "#422006", stroke: "#d97706", glow: "0 0 12px rgba(245,158,11,0.6)", label: "Moderate" };
  if (level <= 8)  return { fill: "#431407", stroke: "#ea580c", glow: "0 0 14px rgba(234,88,12,0.7)",  label: "Severe" };
  return             { fill: "#3f0000", stroke: "#ef4444", glow: "0 0 18px rgba(239,68,68,0.8)",  label: "Critical" };
}

interface Props {
  onChange: (data: { part: string; pain: number }[]) => void;
}

export default function BodyHeatmap({ onChange }: Props) {
  const [painMap, setPainMap] = useState<Record<string, number>>({});
  const [active, setActive]   = useState<string | null>(null);

  const handleClick = (id: string) => {
    setActive(id);
    if (!painMap[id]) {
      const next = { ...painMap, [id]: 5 };
      setPainMap(next);
      onChange(Object.entries(next).map(([part, pain]) => ({ part, pain })));
    }
  };

  const setLevel = (id: string, val: number) => {
    const next = val === 0
      ? Object.fromEntries(Object.entries(painMap).filter(([k]) => k !== id))
      : { ...painMap, [id]: val };
    setPainMap(next);
    onChange(Object.entries(next).map(([part, pain]) => ({ part, pain })));
    if (val === 0) setActive(null);
  };

  const renderPart = (p: BodyPart) => {
    const pain  = painMap[p.id] ?? 0;
    const style = getPainStyle(pain);
    const isAct = active === p.id;

    const sharedProps = {
      key: p.id,
      onClick: () => handleClick(p.id),
      style: { cursor: "pointer", filter: style.glow !== "none" ? `drop-shadow(${style.glow.replace("box-shadow:","")})` : undefined },
    };

    // 3-D effect: draw a slightly darker shape offset down-right first (shadow), then main shape
    const shadowFill = "#0a1520";
    const OFFSET = 3;

    if (p.shape === "ellipse") {
      const cx = p.x + p.w / 2, cy = p.y + p.h / 2, rx = p.w / 2, ry = p.h / 2;
      return (
        <g {...sharedProps}>
          {/* shadow layer */}
          <ellipse cx={cx + OFFSET} cy={cy + OFFSET} rx={rx} ry={ry} fill={shadowFill} opacity={0.5} />
          {/* highlight rim (top-left lighter) */}
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
            fill={style.fill} stroke={isAct ? "#38bdf8" : style.stroke} strokeWidth={isAct ? 2 : 1.2} />
          {/* specular highlight */}
          <ellipse cx={cx - rx * 0.25} cy={cy - ry * 0.28} rx={rx * 0.35} ry={ry * 0.22}
            fill="rgba(255,255,255,0.07)" />
        </g>
      );
    }

    // roundRect
    const { x, y, w, h, rx: r = 6 } = p;
    return (
      <g {...sharedProps}>
        <rect x={x + OFFSET} y={y + OFFSET} width={w} height={h} rx={r} fill={shadowFill} opacity={0.5} />
        <rect x={x} y={y} width={w} height={h} rx={r}
          fill={style.fill} stroke={isAct ? "#38bdf8" : style.stroke} strokeWidth={isAct ? 2 : 1.2} />
        {/* top specular */}
        <rect x={x + 4} y={y + 3} width={w - 8} height={Math.min(h * 0.3, 10)} rx={r - 2}
          fill="rgba(255,255,255,0.06)" />
      </g>
    );
  };

  const selectedEntries = Object.entries(painMap);
  const activePart = BODY_PARTS.find(b => b.id === active);

  return (
    <div className="flex gap-6 flex-wrap">

      {/* ── SVG BODY ── */}
      <div className="relative flex-shrink-0 select-none">
        {/* ambient glow behind figure */}
        <div className="absolute inset-0 rounded-2xl"
          style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(56,189,248,0.04) 0%, transparent 70%)" }} />
        <svg viewBox="0 0 200 348" width={170} height={295}
          style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))" }}>

          {/* body-wide base outline so limbs look connected */}
          <rect x={62} y={78} width={76} height={122} rx={14}
            fill="none" stroke="rgba(56,189,248,0.04)" strokeWidth={30} />

          {BODY_PARTS.map(renderPart)}
        </svg>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 space-y-4 min-w-[180px]">

        {/* Legend */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "Mild 1–3",      color: "bg-green-500",  ring: "ring-green-500/30" },
            { label: "Moderate 4–6",  color: "bg-amber-500",  ring: "ring-amber-500/30" },
            { label: "Severe 7–8",    color: "bg-orange-500", ring: "ring-orange-500/30" },
            { label: "Critical 9–10", color: "bg-red-500",    ring: "ring-red-500/30" },
          ].map(({ label, color, ring }) => (
            <div key={label} className={`flex items-center gap-2 text-[11px] text-slate-300 bg-slate-800/60 px-2 py-1.5 rounded-lg ring-1 ${ring}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
              {label}
            </div>
          ))}
        </div>

        {/* Active part slider */}
        <AnimatePresence mode="wait">
          {active && activePart && (
            <motion.div key={active}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="bg-slate-800/80 backdrop-blur border border-slate-700/60 p-4 rounded-2xl space-y-3"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
              <div className="flex justify-between items-center">
                <span className="text-sky-400 text-xs font-black uppercase tracking-widest">{activePart.label}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  (painMap[active] ?? 0) <= 3 ? "bg-green-900/60 text-green-400" :
                  (painMap[active] ?? 0) <= 6 ? "bg-amber-900/60 text-amber-400" :
                  (painMap[active] ?? 0) <= 8 ? "bg-orange-900/60 text-orange-400" :
                  "bg-red-900/60 text-red-400"
                }`}>
                  {getPainStyle(painMap[active] ?? 0).label || "None"} — {painMap[active] ?? 0}/10
                </span>
              </div>

              {/* custom styled range */}
              <div className="relative">
                <input type="range" min={0} max={10} step={1}
                  value={painMap[active] ?? 0}
                  onChange={(e) => setLevel(active, Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right,
                      #22c55e 0%, #22c55e 30%,
                      #f59e0b 30%, #f59e0b 60%,
                      #f97316 60%, #f97316 80%,
                      #ef4444 80%, #ef4444 100%)`,
                    accentColor: "#38bdf8",
                  }}
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0</span><span>5</span><span>10</span>
                </div>
              </div>

              <button onClick={() => setLevel(active, 0)}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold transition-colors">
                ✕ Remove marking
              </button>
            </motion.div>
          )}
          {!active && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[12px] text-slate-500 italic text-center py-6 border border-dashed border-slate-700/50 rounded-2xl">
              👆 Tap any body part<br />to mark pain location
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected summary */}
        {selectedEntries.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Marked Locations</p>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {selectedEntries.map(([id, level]) => {
                const part = BODY_PARTS.find(b => b.id === id);
                const s = getPainStyle(level);
                return (
                  <div key={id}
                    onClick={() => setActive(id)}
                    className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800/60 transition-colors"
                    style={{ borderLeft: `3px solid ${s.stroke}` }}>
                    <span className="text-slate-300">{part?.label}</span>
                    <span className="font-bold text-slate-400">{level}/10</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}