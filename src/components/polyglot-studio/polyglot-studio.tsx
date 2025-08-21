'use client';

import { useState, useCallback, useRef, FormEvent } from 'react';
import { Download, Languages, Play, FileText, LoaderCircle, Send, Globe, Code } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { languages, templates, type Language, type LanguageValue } from '@/lib/templates';
import { runCode } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HistoryItem {
  type: 'output' | 'input';
  content: string;
}

export default function PolyglotStudio() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [code, setCode] = useState<string>(templates.html.code);
  const [output, setOutput] = useState<string>(templates.html.code);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const { toast } = useToast();
  const outputEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('editor');

  const scrollToBottom = () => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLanguageChange = useCallback((langValue: LanguageValue) => {
    const newLang = languages.find(l => l.value === langValue) || languages[0];
    setSelectedLanguage(newLang);
    const newCode = templates[newLang.value].code;
    setCode(newCode);
    setHistory([]);
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
    setHistory([]);
    if (newLang.isWeb) {
      setOutput(newCode);
    } else {
      setOutput('');
    }
    setActiveTab('editor');
  }, []);

  const execute = useCallback(async (stdin?: string) => {
    if (selectedLanguage.isWeb) {
      if (selectedLanguage.value === 'javascript') {
        setOutput(`<html><head><style>body{font-family:sans-serif;color:hsl(var(--foreground));background-color:transparent;}</style></head><body><script>${code}</script></body></html>`);
      } else {
        setOutput(code);
      }
      setActiveTab('preview');
      return;
    }
    
    setIsExecuting(true);
    setActiveTab('output');
    if(stdin) {
      setHistory(prev => [...prev, { type: 'input', content: stdin }]);
    } else {
      setHistory([]); // Start new session
    }

    try {
      const fullHistory = [...history, ...(stdin ? [{type: 'input' as const, content: stdin}] : [])];
      const combinedStdin = fullHistory.map(h => h.type === 'input' ? `> ${h.content}` : h.content).join('\n');

      const result = await runCode({ language: selectedLanguage.label, code, stdin: combinedStdin });
      const newHistory = stdin ? [...history, { type: 'input', content: stdin }] : [];
      setHistory([...newHistory, { type: 'output', content: result }]);
      setOutput(result);
      setUserInput('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Execution Error",
        description: "Failed to execute the code.",
      })
      setOutput("Error executing code.");
      setHistory(prev => [...prev, { type: 'output', content: "Error executing code." }]);
    } finally {
      setIsExecuting(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [code, selectedLanguage, toast, history]);

  const handleRunCode = useCallback(() => {
    toast({
      title: "Running Code...",
      description: `Executing your ${selectedLanguage.label} code.`,
    })
    execute();
  }, [execute, selectedLanguage.label, toast]);
  
  const handleUserInputSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isExecuting) return;
    execute(userInput.trim());
  };

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

  const mainView = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <TabsList>
          <TabsTrigger value="editor">
            <Code className="w-4 h-4 mr-2"/>
            Editor
            </TabsTrigger>
          <TabsTrigger value={selectedLanguage.isWeb ? 'preview' : 'output'}>
            <Globe className="w-4 h-4 mr-2"/>
            {selectedLanguage.isWeb ? 'Preview' : 'Output'}
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
           <Select onValueChange={(value: LanguageValue) => handleLanguageChange(value)} value={selectedLanguage.value}>
            <SelectTrigger className="w-[180px] bg-background border-0">
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
            <SelectTrigger className="w-[200px] bg-background border-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <SelectValue placeholder="Select a Template" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(templates).map(([key, template]) => (
                <SelectItem key={`${key}:template`} value={`${key}:template`}>
                  {template.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleRunCode} variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isExecuting}>
            {isExecuting && history.length === 0 ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Run
          </Button>
          <Button onClick={handleDownload} variant="ghost">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <TabsContent value="editor" className="flex-1 h-0">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your code here..."
          className="flex-1 w-full h-full resize-none font-code bg-transparent text-gray-100 rounded-none border-0 focus-visible:ring-0 p-4 text-sm"
        />
      </TabsContent>
      <TabsContent value="preview" className="flex-1 h-0 bg-white">
        <iframe
          srcDoc={output}
          title="Code Preview"
          sandbox="allow-scripts allow-modals"
          className="w-full h-full border-0"
        />
      </TabsContent>
      <TabsContent value="output" className="flex-1 h-0">
        <div className="p-4 h-full flex flex-col gap-2 flex-1">
          <div className="flex-1 p-4 rounded-md bg-muted/50 font-code text-sm overflow-auto">
            {history.length === 0 && !isExecuting && <pre className="whitespace-pre-wrap">Click 'Run' to see the output.</pre>}
            {history.map((item, index) => (
              <div key={index}>
                {item.type === 'output' ? (
                  <pre className="whitespace-pre-wrap">{item.content}</pre>
                ) : (
                  <pre className="whitespace-pre-wrap text-muted-foreground">&gt; {item.content}</pre>
                )}
              </div>
            ))}
            {isExecuting && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <LoaderCircle className="w-5 h-5 animate-spin"/>
                <h3 className="font-semibold">Executing...</h3>
              </div>
            )}
            <div ref={outputEndRef} />
          </div>
          <form onSubmit={handleUserInputSubmit} className="flex gap-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your input here..."
              className="flex-1 font-code bg-muted/50"
              disabled={isExecuting}
            />
            <Button type="submit" variant="secondary" disabled={isExecuting}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </TabsContent>
    </Tabs>
  )

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0">
        <Card className="flex flex-col h-full rounded-none border-0 border-r">
          {mainView}
        </Card>
        <Card className="hidden md:flex flex-col h-full rounded-none border-0">
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              {selectedLanguage.isWeb ? 'Browser Preview' : 'Output'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 bg-card rounded-b-lg p-0 flex flex-col">
            {selectedLanguage.isWeb ? (
              <iframe
                srcDoc={output}
                title="Code Preview"
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0 rounded-b-lg bg-white"
              />
            ) : (
              <div className="p-4 h-full flex flex-col gap-2 flex-1">
                <div className="flex-1 p-4 rounded-md bg-muted/50 font-code text-sm overflow-auto">
                  {history.length === 0 && !isExecuting && <pre className="whitespace-pre-wrap">Click 'Run Code' to see the output.</pre>}
                  {history.map((item, index) => (
                    <div key={index}>
                      {item.type === 'output' ? (
                        <pre className="whitespace-pre-wrap">{item.content}</pre>
                      ) : (
                        <pre className="whitespace-pre-wrap text-muted-foreground">&gt; {item.content}</pre>
                      )}
                    </div>
                  ))}
                  {isExecuting && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <LoaderCircle className="w-5 h-5 animate-spin"/>
                      <h3 className="font-semibold">Executing...</h3>
                    </div>
                  )}
                  <div ref={outputEndRef} />
                </div>
                <form onSubmit={handleUserInputSubmit} className="flex gap-2">
                  <Input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your input here..."
                    className="flex-1 font-code bg-muted/50"
                    disabled={isExecuting}
                  />
                  <Button type="submit" variant="secondary" disabled={isExecuting}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}