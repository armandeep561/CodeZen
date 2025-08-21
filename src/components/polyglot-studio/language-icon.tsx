
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
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#F7DF1E" stroke="#000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M0 0h24v24H0z" fill="none" stroke="none"/><path d="M3 3h18v18H3z"/><path d_p_1="M10 15V9h4" d="m10 15 2-2 2 2" stroke="#fff"/><path d_p_2="M15 15a1 1 0 0 0 1-1v-4a1 1 0 0 0-2 0v4a1 1 0 0 0 1 1" stroke="#fff"/></svg>
    ),
    python: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.83 8.67c.36-1.18.0-2.4-1-3.17s-2.35-.5-3.33.33c-.98.83-1.22 2.18-.86 3.36.36 1.18-.0 2.4 1 3.17s2.35.5 3.33-.33c.98-.83 1.22-2.18.86-3.36Z"/><path d="M10.17 15.33c-.36 1.18-.0 2.4 1 3.17s2.35.5 3.33-.33c.98-.83 1.22-2.18.86-3.36-.36-1.18.0-2.4-1-3.17s-2.35-.5-3.33.33c-.98.83-1.22 2.18-.86 3.36Z"/><path d="M12 9v2"/><path d="M12 13v2"/></svg>
    ),
    php: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#777BB4" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-3.5h-1v-7h1c1.38 0 2.5 1.12 2.5 2.5v2c0 1.38-1.12 2.5-2.5 2.5zm0-1.5c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1h-1v4h1zm4.5 0h-1v-7h1c1.38 0 2.5 1.12 2.5 2.5v2c0 1.38-1.12 2.5-2.5 2.5zm0-1.5c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1h-1v4h1zm4.5 0h-1v-7h2.5c.83 0 1.5.67 1.5 1.5v0c0 .83-.67 1.5-1.5 1.5H17v1h1.5c.83 0 1.5.67 1.5 1.5v0c0 .83-.67 1.5-1.5 1.5H17v1h-1.5z"/></svg>
    ),
    c: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 16.29a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M13.71 7.71a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/><path d="M12 12h-2.5"/></svg>
    ),
    cpp: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#004482" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 16.29a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M13.71 7.71a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/><path d="M12 12h-2.5"/><path d="M17 10h2m-1-1v2m-9 3h2m-1-1v2"/></svg>
    ),
    java: (
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007396" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 8c-3.18.5-5.5 3.5-5.5 7S4.82 22 8 22s5.5-2.5 5.5-6.5c0-1.79-1.39-4-3-4.5S6.5 9 6.5 8s1.5-2 3-2 3 .5 3 2-1.5 2-3 2-3-1-3-2 .5-2 3-2"/><path d="M12 15h4m-2-2v4"/><path d="M16 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2 3 3 0 0 1-3-3 2 2 0 0 1 2-2z"/></svg>
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
