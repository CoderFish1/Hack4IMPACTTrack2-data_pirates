"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle, ShieldAlert, Mic } from "lucide-react";

interface AIResult {
  possible_conditions: string[];
  precautions: string[];
  recommendation_level: "Self-Care" | "Consult Doctor" | "Urgent Care";
}

export default function Home() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (!res.ok) throw new Error("Failed to analyze symptoms");

      const data: AIResult = await res.json();
      setResult(data);
    } catch (err) {
      setError("Our AI is currently taking a break. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationStyle = (level: string) => {
    switch (level) {
      case "Urgent Care": return "bg-red-100 text-red-800 border-red-300";
      case "Consult Doctor": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-green-100 text-green-800 border-green-300";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 🚨 Mandatory Medical Disclaimer */}
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Important Disclaimer</AlertTitle>
          <AlertDescription>
            This AI assistant is for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. In a medical emergency, call your local emergency services immediately.
          </AlertDescription>
        </Alert>

        {/* 🎯 Header */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-3">
            <Activity className="text-blue-600 h-10 w-10" />
            Smart Healthcare AI
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Describe how you are feeling, and our AI will help triage your symptoms.</p>
        </div>

        {/* ✍️ Input Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <div className="relative">
            <Textarea 
              placeholder="e.g., I've had a sharp pain behind my left eye for 2 days, and bright lights make it worse..."
              className="min-h-[120px] text-lg resize-none p-4"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
            <Button size="icon" variant="ghost" className="absolute bottom-2 right-2 text-slate-400 hover:text-blue-600">
              <Mic className="h-5 w-5" />
            </Button>
          </div>
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 transition-all"
          >
            {loading ? "Analyzing Symptoms..." : "Analyze Symptoms"}
          </Button>
        </div>

        {/* ⏳ Loading State (The Skeleton) */}
        {loading && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="flex gap-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-6 w-32" /></div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {/* 📊 Results Dashboard */}
        {result && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`p-4 border-b flex items-center gap-3 font-semibold text-lg ${getRecommendationStyle(result.recommendation_level)}`}>
              <AlertTriangle className="h-6 w-6" />
              Recommendation: {result.recommendation_level}
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Possible Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {result.possible_conditions.map((condition, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm py-1 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Actionable Precautions</h3>
                <ul className="space-y-2">
                  {result.precautions.map((precaution, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {precaution}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}