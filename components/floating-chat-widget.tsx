"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2, HeartPulse, LogIn } from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "My chest feels tight and I'm sweating",
  "I have a high fever and headache",
  "I've been having shortness of breath",
];

export default function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your **AI Health Assistant**. Describe your symptoms and I'll give you a quick preliminary assessment.\n\n> ℹ️ **[Login as Patient](/login)** to use our full AI Triage with specialist consensus, medical history, and SBAR reports.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/quick-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply || "I couldn't process that. Please try again." }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ Connection issue. For full AI Triage, [sign in here](/login)." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-emerald-500 dark:text-emerald-400 font-bold underline underline-offset-2">$1</a>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-amber-400 pl-3 text-amber-700 dark:text-amber-300 text-xs mt-1">$1</blockquote>')
      .replace(/\n/g, "<br/>");

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        animate={{ scale: open ? 0.8 : 1, opacity: open ? 0 : 1 }}
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center transition-colors group"
        title="Chat with AI"
      >
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
          <HeartPulse className="h-7 w-7" />
        </motion.div>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 flex">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
        </span>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-[9999] w-[380px] max-w-[calc(100vw-24px)] rounded-3xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#0d1320] shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "540px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white flex-shrink-0">
              <HeartPulse className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm leading-none">AI Health Assistant</h3>
                <p className="text-[10px] text-white/70 mt-0.5 font-medium">Quick symptom check • Free</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button className="flex items-center gap-1 text-[10px] font-black bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors">
                    <LogIn className="h-3 w-3" /> Full Access
                  </button>
                </Link>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50 dark:bg-[#0a0f1a]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                      <HeartPulse className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-emerald-500 text-white rounded-tr-sm font-medium"
                        : "bg-white dark:bg-white/[0.05] text-slate-800 dark:text-slate-200 rounded-tl-sm border border-black/5 dark:border-white/10"
                    }`}
                    dangerouslySetInnerHTML={{ __html: renderMessage(m.content) }}
                  />
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center mr-2 mt-1">
                    <HeartPulse className="h-3.5 w-3.5 text-white animate-pulse" />
                  </div>
                  <div className="bg-white dark:bg-white/[0.05] border border-black/5 dark:border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 bg-slate-50 dark:bg-[#0a0f1a] border-t border-black/5 dark:border-white/5 flex gap-1.5 flex-wrap flex-shrink-0">
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => send(p)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 bg-white dark:bg-[#0d1320] border-t border-black/5 dark:border-white/10 flex items-center gap-2 flex-shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Describe your symptoms..."
                className="flex-1 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
