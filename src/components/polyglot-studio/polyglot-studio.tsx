'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Bot, Download, Languages, LoaderCircle, Play, FileText, FileCode2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { languages, templates, type Language, type LanguageValue } from '@/lib/templates';
import { getAiHint } from '@/app/actions';

export default function PolyglotStudio() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [code, setCode] = useState<string>(templates.html.code);
  const [output, setOutput] = useState<string>(templates.html.code);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleLanguageChange = useCallback((langValue: LanguageValue) => {
    const newLang = languages.find(l => l.value === langValue) || languages[0];
    setSelectedLanguage(newLang);
    setCode(templates[newLang.value].code);
    setAiHint(null);
    if (newLang.isWeb) {
      setOutput(templates[newLang.value].code);
    } else {
      setOutput('');
    }
  }, []);

  const handleTemplateChange = useCallback((templateKey: string) => {
    const [langValue] = templateKey.split(':');
    const newLang = languages.find(l => l.value === langValue) || languages[0];
    const newCode = templates[langValue as LanguageValue].code;

    setSelectedLanguage(newLang);
    setCode(newCode);
    setAiHint(null);
    if (newLang.isWeb) {
      setOutput(newCode);
    } else {
      setOutput('');
    }
  }, []);

  const handleRunCode = useCallback(() => {
    if (selectedLanguage.isWeb) {
      if (selectedLanguage.value === 'javascript') {
        setOutput(`<html><head><style>body{font-family:sans-serif;color:hsl(var(--foreground));background-color:transparent;}</style></head><body><script>${code}</script></body></html>`);
      } else {
        setOutput(code);
      }
    } else {
      // For non-web languages, use "Run" to trigger an AI hint
      fetchAiHint(true);
    }
    toast({
      title: "Code Executed",
      description: `Running ${selectedLanguage.label} code. Preview updated.`,
    })
  }, [code, selectedLanguage]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${selectedLanguage.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Download Started",
      description: `Your ${selectedLanguage.label} file is downloading.`,
    })
  }, [code, selectedLanguage]);

  const fetchAiHint = async (force = false) => {
    if (code.trim().length < 20 && !force) return;
    setIsHintLoading(true);
    try {
      const hint = await getAiHint({ language: selectedLanguage.label, codeContext: code });
      setAiHint(hint);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to get AI-powered hint.",
      })
      setAiHint("Error fetching hint.");
    } finally {
      setIsHintLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchAiHint();
    }, 1500);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [code, selectedLanguage]);

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-background">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <FileCode2 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-foreground">Polyglot Studio</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <Select onValueChange={(value: LanguageValue) => handleLanguageChange(value)} value={selectedLanguage.value}>
            <SelectTrigger className="w-[180px] bg-card">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                <SelectValue placeholder="Select Language" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => handleTemplateChange(value)}>
            <SelectTrigger className="w-[200px] bg-card">
               <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <SelectValue placeholder="Select a Template" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={`${lang.value}:template`} value={`${lang.value}:template`}>
                  {templates[lang.value].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleRunCode} variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Play className="mr-2 h-4 w-4" />
            Run Code
          </Button>
          <Button onClick={handleDownload} variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </header>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Code Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="flex-1 w-full h-full resize-none font-code bg-gray-900 text-gray-100 rounded-none border-0 focus-visible:ring-1 focus-visible:ring-ring p-4 text-sm"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              {selectedLanguage.isWeb ? 'Browser Preview' : 'AI Assistant'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 bg-card rounded-b-lg">
            {selectedLanguage.isWeb ? (
              <iframe
                srcDoc={output}
                title="Code Preview"
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0 rounded-md bg-white"
              />
            ) : (
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Bot className="w-5 h-5"/>
                  <h3 className="font-semibold">AI Code Hints</h3>
                </div>
                <div className="flex-1 p-4 rounded-md bg-muted/50 font-code text-sm overflow-auto">
                  {isHintLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap">{aiHint || "Type some code or click 'Run Code' to get an AI hint."}</pre>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
