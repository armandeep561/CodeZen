'use client';

import { useState, useCallback, useRef } from 'react';
import { Bot, Download, Languages, Play, FileText, FileCode2, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { languages, templates, type Language, type LanguageValue } from '@/lib/templates';
import { runCode } from '@/app/actions';

export default function PolyglotStudio() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [code, setCode] = useState<string>(templates.html.code);
  const [output, setOutput] = useState<string>(templates.html.code);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleLanguageChange = useCallback((langValue: LanguageValue) => {
    const newLang = languages.find(l => l.value === langValue) || languages[0];
    setSelectedLanguage(newLang);
    const newCode = templates[newLang.value].code;
    setCode(newCode);
    if (newLang.isWeb) {
      setOutput(newCode);
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
    if (newLang.isWeb) {
      setOutput(newCode);
    } else {
      setOutput('');
    }
  }, []);

  const handleRunCode = useCallback(async () => {
    toast({
      title: "Running Code...",
      description: `Executing your ${selectedLanguage.label} code.`,
    })
    if (selectedLanguage.isWeb) {
      if (selectedLanguage.value === 'javascript') {
        setOutput(`<html><head><style>body{font-family:sans-serif;color:hsl(var(--foreground));background-color:transparent;}</style></head><body><script>${code}</script></body></html>`);
      } else {
        setOutput(code);
      }
    } else {
      setIsExecuting(true);
      try {
        const result = await runCode({ language: selectedLanguage.label, code });
        setOutput(result);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Execution Error",
          description: "Failed to execute the code.",
        })
        setOutput("Error executing code.");
      } finally {
        setIsExecuting(false);
      }
    }
  }, [code, selectedLanguage, toast]);

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
  }, [code, selectedLanguage.label, selectedLanguage.extension, toast]);

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

          <Button onClick={handleRunCode} variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isExecuting}>
            {isExecuting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
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
              {selectedLanguage.isWeb ? 'Browser Preview' : 'Output'}
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
                <div className="flex-1 p-4 rounded-md bg-muted/50 font-code text-sm overflow-auto">
                  {isExecuting ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <LoaderCircle className="w-5 h-5 animate-spin"/>
                      <h3 className="font-semibold">Executing...</h3>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap">{output || "Click 'Run Code' to see the output."}</pre>
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
