const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(fullPath));
        } else { 
            if (fullPath.endsWith('.tsx')) results.push(fullPath);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'app/dashboard'));
files.push(path.join(__dirname, 'app/(auth)/login/page.tsx'));
files.push(path.join(__dirname, 'app/(auth)/register/page.tsx'));
files.push(path.join(__dirname, 'app/page.tsx')); // Landing page too
files.push(path.join(__dirname, 'components/splash-screen.tsx'));

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Simple naive global replacement, ignoring the lookbehinds since they might be failing
    // We replace all standalone text-white, and then we will clean up duplicates!
    content = content.replace(/text-white/g, "text-slate-900 dark:text-white");
    content = content.replace(/text-slate-400/g, "text-slate-600 dark:text-slate-400");
    content = content.replace(/text-slate-300/g, "text-slate-700 dark:text-slate-300");
    content = content.replace(/bg-white\/5/g, "bg-black/5 dark:bg-white/5");
    content = content.replace(/bg-white\/10/g, "bg-black/10 dark:bg-white/10");
    content = content.replace(/bg-white\/20/g, "bg-black/20 dark:bg-white/20");
    
    // Clean up if we accidentally created dark:text-slate-900 dark:text-white dark:text-white
    content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-white/g, "text-slate-900 dark:text-white");
    content = content.replace(/dark:text-slate-900 dark:text-white/g, "dark:text-white");
    content = content.replace(/dark:text-slate-600 dark:text-slate-400/g, "dark:text-slate-400");
    content = content.replace(/dark:text-slate-700 dark:text-slate-300/g, "dark:text-slate-300");
    
    // Fix backgrounds that might have been duplicated
    content = content.replace(/dark:bg-black\/5 dark:bg-white\/5/g, "dark:bg-white/5");
    content = content.replace(/dark:bg-black\/10 dark:bg-white\/10/g, "dark:bg-white/10");

    fs.writeFileSync(file, content, 'utf8');
    console.log("Forced update on:", file);
});
console.log("DONE");
