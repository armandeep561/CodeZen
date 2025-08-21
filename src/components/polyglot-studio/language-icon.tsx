
'use client';

import { FileText } from 'lucide-react';
import type { LanguageValue } from '@/lib/templates';
import { languages } from '@/lib/templates';

const icons: Record<string, React.ReactNode> = {
    html: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E34F26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 4l1.5 16L12 22l8.5-2L22 4z"/><path d="M12 11.5V22"/><path d="M12 11.5H7.5m7 0H12"/><path d="M15.5 8.5H12V5.5"/><path d="M8.5 14.5H12v3"/><path d="M15.5 14.5H12"/></svg>
    ),
    css: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1572B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 4l1.5 16L12 22l8.5-2L22 4z"/><path d="M12 11.5V22"/><path d="M12 11.5H7.5m7 0H12"/><path d="M15.5 8.5H12V5.5"/><path d="M8.5 14.5H12v3"/><path d="M15.5 14.5H12"/></svg>
    ),
    javascript: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#F7DF1E" stroke="none"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 3h18v18H3z"/><path d="M10 15V9h4" stroke="#000" strokeWidth="2" strokeLinecap="round"/><path d="M10 12h3" stroke="#000" strokeWidth="2" strokeLinecap="round"/><path d="M16 15a1 1 0 0 0 1-1v-4a1 1 0 0 0-2 0v4a1 1 0 0 0 1 1z" fill="#000"/></svg>
    ),
    python: (
       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.83 8.67c.36-1.18.0-2.4-1-3.17s-2.35-.5-3.33.33c-.98.83-1.22 2.18-.86 3.36.36 1.18-.0 2.4 1 3.17s2.35.5 3.33-.33c.98-.83 1.22-2.18.86-3.36Z" fill="#306998"/>
        <path d="M10.17 15.33c-.36 1.18-.0 2.4 1 3.17s2.35.5 3.33-.33c.98-.83 1.22-2.18.86-3.36-.36-1.18.0-2.4-1-3.17s-2.35-.5-3.33.33c-.98.83-1.22 2.18-.86 3.36Z" fill="#FFD43B"/>
       </svg>
    ),
    php: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#777BB4" stroke="none">
            <ellipse cx="12" cy="12" rx="10" ry="7"/>
            <path d="M7.5 9.5h2c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5h-2v-5zm2 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-1.5v1h1.5zm3.5-3.5h2c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5h-2v-5zm2 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-1.5v1h1.5zm3.5-3.5h1.5l-1 2.5 1 2.5h-1.5l-1-2.5 1-2.5z" fill="#000000" opacity="0.6"/>
        </svg>
    ),
    c: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8B9CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 19.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z"/>
            <path d="M12 11.5h-1.5c-2.21 0-4-1.79-4-4s1.79-4 4-4h2"/>
        </svg>
    ),
    cpp: (
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#004482" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 19.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z"/>
            <path d="M12 11.5h-1.5c-2.21 0-4-1.79-4-4s1.79-4 4-4h2"/>
            <path d="M14.5 12.5v3m1.5-1.5h-3m-1.5-6v3m1.5-1.5h-3"/>
        </svg>
    ),
    java: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 8c-3.18.5-5.5 3.5-5.5 7S4.82 22 8 22s5.5-2.5 5.5-6.5c0-1.79-1.39-4-3-4.5S6.5 9 6.5 8s1.5-2 3-2 3 .5 3 2-1.5 2-3 2-3-1-3-2 .5-2 3-2" stroke="#f89820"/>
            <path d="M12 15h4m-2-2v4" stroke="#5382a1"/>
            <path d="M16 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2 3 3 0 0 1-3-3 2 2 0 0 1 2-2z" stroke="#5382a1"/>
        </svg>
    ),
};


export function LanguageIcon({ language, fileName }: { language?: LanguageValue | null, fileName?: string }) {
    let langKey: LanguageValue | undefined;

    if (language) {
        langKey = language;
    } else if (fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase();
        langKey = languages.find(l => l.extension === extension)?.value;
    }

    if (langKey && icons[langKey]) {
        return <span className="w-4 h-4 mr-2 flex items-center justify-center">{icons[langKey]}</span>;
    }

    return <FileText className="w-4 h-4 mr-2" />;
}
