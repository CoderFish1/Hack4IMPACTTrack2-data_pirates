const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'app/dashboard'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Safety check: if it already has dark:text-white and we replace text-white AGAIN, it becomes dark:text-slate-900 dark:text-white. 
    // We only replace if not preceded by `dark:` or followed by `dark:`
    
    const replacements = [
        [/(?<!dark:)\btext-white\b(?! dark:)/g, "text-slate-900 dark:text-white"],
        [/(?<!dark:)\btext-slate-400\b(?! dark:)/g, "text-slate-600 dark:text-slate-400"],
        [/(?<!dark:)\btext-slate-300\b(?! dark:)/g, "text-slate-700 dark:text-slate-300"],
        [/(?<!dark:)\btext-slate-200\b(?! dark:)/g, "text-slate-800 dark:text-slate-200"],
        [/(?<!dark:)\btext-slate-500\b(?! dark:)/g, "text-slate-500 dark:text-slate-400"],
        // Backgrounds
        [/(?<!dark:)\bbg-white\/5\b(?! dark:)/g, "bg-black/5 dark:bg-white/5"],
        [/(?<!dark:)\bbg-white\/10\b(?! dark:)/g, "bg-black/10 dark:bg-white/10"],
        [/(?<!dark:)\bbg-white\/20\b(?! dark:)/g, "bg-black/20 dark:bg-white/20"],
        [/(?<!dark:)bg-white\/\s*\[0\.02\](?! dark:)/g, "bg-black/[0.02] dark:bg-white/[0.02]"],
        [/(?<!dark:)bg-white\/\s*\[0\.04\](?! dark:)/g, "bg-black/[0.04] dark:bg-white/[0.04]"],
        [/(?<!dark:)bg-white\/\s*\[0\.05\](?! dark:)/g, "bg-black/[0.05] dark:bg-white/[0.05]"],
        [/(?<!dark:)bg-white\/\s*\[0\.06\](?! dark:)/g, "bg-black/[0.06] dark:bg-white/[0.06]"],
        [/(?<!dark:)bg-white\/\s*\[0\.08\](?! dark:)/g, "bg-black/[0.08] dark:bg-white/[0.08]"],
        [/(?<!dark:)bg-white\/\s*\[0\.03\](?! dark:)/g, "bg-black/[0.03] dark:bg-white/[0.03]"],
        [/(?<!dark:)\bbg-black\/40\b(?! dark:)/g, "bg-white/80 dark:bg-black/40"],
        // Borders
        [/(?<!dark:)\bborder-white\/10\b(?! dark:)/g, "border-black/10 dark:border-white/10"],
        [/(?<!dark:)\bborder-white\/20\b(?! dark:)/g, "border-black/20 dark:border-white/20"],
        [/(?<!dark:)border-white\/\s*\[0\.06\](?! dark:)/g, "border-black/[0.06] dark:border-white/[0.06]"],
        [/(?<!dark:)border-white\/\s*\[0\.08\](?! dark:)/g, "border-black/[0.08] dark:border-white/[0.08]"]
    ];

    let newContent = content;
    for (const [regex, replacement] of replacements) {
        newContent = newContent.replace(regex, replacement);
    }

    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log("Updated", file);
    }
});
console.log("DONE!");
