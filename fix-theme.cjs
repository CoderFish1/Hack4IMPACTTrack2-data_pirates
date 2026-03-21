const fs = require("fs");
const path = require("path");

const dirs = [
  "app/dashboard/patient/page.tsx",
  "app/dashboard/doctor/page.tsx",
  "app/dashboard/admin/page.tsx",
  "app/dashboard/triage/page.tsx"
];

dirs.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (!fs.existsSync(filepath)) return;
  
  let content = fs.readFileSync(filepath, "utf8");

  // Regex replacements to insert dark: utilities and swap light mode defaults
  // Text colors
  content = content.replace(/\btext-white\b(?! dark:)/g, "text-slate-900 dark:text-white");
  content = content.replace(/\btext-slate-400\b(?! dark:)/g, "text-slate-600 dark:text-slate-400");
  content = content.replace(/\btext-slate-300\b(?! dark:)/g, "text-slate-700 dark:text-slate-300");
  content = content.replace(/\btext-slate-200\b(?! dark:)/g, "text-slate-800 dark:text-slate-200");
  content = content.replace(/\btext-slate-500\b(?! dark:)/g, "text-slate-500 dark:text-slate-400"); // some slate-500 might stay 500 in light, 400 in dark

  // Backgrounds with opacity
  content = content.replace(/\bbg-white\/5\b(?! dark:)/g, "bg-black/5 dark:bg-white/5");
  content = content.replace(/\bbg-white\/10\b(?! dark:)/g, "bg-black/10 dark:bg-white/10");
  content = content.replace(/\bbg-white\/20\b(?! dark:)/g, "bg-black/20 dark:bg-white/20");
  content = content.replace(/bg-white\/\s*\[0\.02\](?! dark:)/g, "bg-black/[0.02] dark:bg-white/[0.02]");
  content = content.replace(/bg-white\/\s*\[0\.04\](?! dark:)/g, "bg-black/[0.04] dark:bg-white/[0.04]");
  content = content.replace(/bg-white\/\s*\[0\.06\](?! dark:)/g, "bg-black/[0.06] dark:bg-white/[0.06]");
  content = content.replace(/bg-white\/\s*\[0\.08\](?! dark:)/g, "bg-black/[0.08] dark:bg-white/[0.08]");
  
  content = content.replace(/\bbg-black\/40\b(?! dark:)/g, "bg-white/80 dark:bg-black/40");
  
  // Borders
  content = content.replace(/\bborder-white\/10\b(?! dark:)/g, "border-black/10 dark:border-white/10");
  content = content.replace(/\bborder-white\/20\b(?! dark:)/g, "border-black/20 dark:border-white/20");
  content = content.replace(/border-white\/\s*\[0\.06\](?! dark:)/g, "border-black/[0.06] dark:border-white/[0.06]");
  content = content.replace(/border-white\/\s*\[0\.08\](?! dark:)/g, "border-black/[0.08] dark:border-white/[0.08]");

  fs.writeFileSync(filepath, content, "utf8");
  console.log("Updated", file);
});
