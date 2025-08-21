
'use client';

import { FileText } from 'lucide-react';
import type { LanguageValue } from '@/lib/templates';
import { languages } from '@/lib/templates';
import { FaJava, FaPhp, FaPython } from 'react-icons/fa';
import { SiHtml5, SiCss3, SiJavascript, SiC, SiCplusplus, SiPhp } from 'react-icons/si';

const icons: Record<string, React.ReactNode> = {
    html: <SiHtml5 style={{ color: '#E34F26' }} />,
    css: <SiCss3 style={{ color: '#1572B6' }} />,
    javascript: <SiJavascript style={{ color: '#F7DF1E' }} />,
    python: <FaPython style={{ color: '#3776AB' }} />,
    php: <SiPhp style={{ color: '#777BB4' }} />,
    c: <SiC style={{ color: '#A8B9CC' }} />,
    cpp: <SiCplusplus style={{ color: '#00599C' }} />,
    java: <FaJava style={{ color: '#007396' }} />,
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
