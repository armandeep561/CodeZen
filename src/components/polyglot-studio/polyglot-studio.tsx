'use client';

import { useState, useCallback, useRef, FormEvent, useEffect } from 'react';
import {
  Download,
  Languages,
  Play,
  FileText,
  LoaderCircle,
  Send,
  Globe,
  Code,
  Files,
  Settings,
  Search,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  languages,
  templates,
  type Language,
  type LanguageValue,
} from '@/lib/templates';
import { runCode } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { FileExplorer, type FileNode } from './file-explorer';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

interface HistoryItem {
  type: 'output' | 'input';
  content: string;
}

const initialFiles: FileNode[] = [
  {
    id: 'html:1',
    name: 'index.html',
    content: templates.html.code,
    language: 'html',
  },
  {
    id: 'python:1',
    name: 'main.py',
    content: templates.python.code,
    language: 'python',
  },
];

export default function PolyglotStudio() {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string | null>('html:1');

  const [output, setOutput] = useState<string>(templates.html.code);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const { toast } = useToast();
  const outputEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('editor');

  const activeFile = files.find((f) => f.id === activeFileId);
  const selectedLanguage =
    languages.find((l) => l.value === activeFile?.language) || languages[0];

  const setCode = (newCode: string) => {
    if (!activeFileId) return;
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === activeFileId ? { ...file, content: newCode } : file
      )
    );
  };
  const code = activeFile?.content || '';

  useEffect(() => {
    if (selectedLanguage.isWeb) {
      setOutput(code);
    }
  }, [code, selectedLanguage.isWeb]);

  const scrollToBottom = () => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLanguageChange = useCallback(
    (langValue: LanguageValue) => {
      if (!activeFileId) return;
      const newLang = languages.find((l) => l.value === langValue);
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === activeFileId ? { ...file, language: langValue } : file
        )
      );

      const newCode = templates[langValue].code;
      setCode(newCode);

      setHistory([]);
      if (newLang?.isWeb) {
        setOutput(newCode);
      } else {
        setOutput('');
      }
    },
    [activeFileId]
  );

  const execute = useCallback(
    async (stdin?: string) => {
      if (!activeFile) return;

      if (selectedLanguage.isWeb) {
        if (selectedLanguage.value === 'javascript') {
          setOutput(
            `<html><head><style>body{font-family:sans-serif;color:hsl(var(--foreground));background-color:transparent;}</style></head><body><script>${code}</script></body></html>`
          );
        } else {
          setOutput(code);
        }
        setActiveTab('preview');
        return;
      }

      setIsExecuting(true);
      setActiveTab('output');
      if (stdin) {
        setHistory((prev) => [...prev, { type: 'input', content: stdin }]);
      } else {
        setHistory([]); // Start new session
      }

      try {
        const fullHistory = [
          ...history,
          ...(stdin ? [{ type: 'input' as const, content: stdin }] : []),
        ];
        const combinedStdin = fullHistory
          .map((h) => (h.type === 'input' ? `> ${h.content}` : h.content))
          .join('\n');

        const result = await runCode({
          language: selectedLanguage.label,
          code,
          stdin: combinedStdin,
        });
        const newHistory = stdin
          ? [...history, { type: 'input', content: stdin }]
          : [];
        setHistory([...newHistory, { type: 'output', content: result }]);
        setOutput(result);
        setUserInput('');
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Execution Error',
          description: 'Failed to execute the code.',
        });
        setOutput('Error executing code.');
        setHistory((prev) => [
          ...prev,
          { type: 'output', content: 'Error executing code.' },
        ]);
      } finally {
        setIsExecuting(false);
        setTimeout(scrollToBottom, 100);
      }
    },
    [code, selectedLanguage, toast, history, activeFile]
  );

  const handleRunCode = useCallback(() => {
    toast({
      title: 'Running Code...',
      description: `Executing your ${selectedLanguage.label} code.`,
    });
    execute();
  }, [execute, selectedLanguage.label, toast]);

  const handleUserInputSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isExecuting) return;
    execute(userInput.trim());
  };

  const handleDownload = useCallback(() => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Download Started',
      description: `Your ${activeFile.name} file is downloading.`,
    });
  }, [activeFile, toast]);

  const handleFileCreate = () => {
    const newFileName = prompt('Enter new file name:', 'new-file.js');
    if (newFileName) {
      const newFile: FileNode = {
        id: `file:${Date.now()}`,
        name: newFileName,
        content: `// New file: ${newFileName}`,
        language: 'javascript',
      };
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
    }
  };

  const handleFileDelete = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(files.length > 1 ? files[0].id : null);
    }
  };

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId);
    const file = files.find((f) => f.id === fileId);
    if (file) {
      const lang = languages.find((l) => l.value === file.language);
      if (lang?.isWeb) {
        setOutput(file.content);
        setActiveTab('preview');
      } else {
        setOutput('');
        setHistory([]);
        setActiveTab('output');
      }
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex flex-col w-12 bg-card border-r items-center py-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Files className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4">
              <SheetTitle>File Explorer</SheetTitle>
            </SheetHeader>
            <Separator />
            <ScrollArea className="h-full">
              <FileExplorer
                files={files}
                activeFileId={activeFileId}
                onFileSelect={handleFileSelect}
                onFileCreate={handleFileCreate}
                onFileDelete={handleFileDelete}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <Button variant="ghost" size="icon">
          <Search className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="flex h-12 items-center px-4 border-b shrink-0 justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-headline">codezen</h1>
          </div>
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value: LanguageValue) => handleLanguageChange(value)}
              value={selectedLanguage.value}
              disabled={!activeFile}
            >
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  <SelectValue placeholder="Select Language" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleRunCode}
              variant="secondary"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isExecuting || !activeFile}
            >
              {isExecuting && history.length === 0 ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run
            </Button>
            <Button
              onClick={handleDownload}
              variant="ghost"
              disabled={!activeFile}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
          <Card className="flex flex-col h-full rounded-none border-0 border-r">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <CardHeader className="flex-row items-center justify-between px-4 py-2 border-b">
                <TabsList>
                  <TabsTrigger value="editor">
                    <Code className="w-4 h-4 mr-2" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger
                    value={selectedLanguage.isWeb ? 'preview' : 'output'}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {selectedLanguage.isWeb ? 'Preview' : 'Output'}
                  </TabsTrigger>
                </TabsList>
                 <div className="text-sm text-muted-foreground">{activeFile?.name}</div>
              </CardHeader>
              <TabsContent value="editor" className="flex-1 h-0 mt-0">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Select a file to start coding, or create a new one."
                  className="flex-1 w-full h-full resize-none font-code bg-transparent text-gray-100 rounded-none border-0 focus-visible:ring-0 p-4 text-sm"
                  disabled={!activeFile}
                />
              </TabsContent>
              <TabsContent value="preview" className="flex-1 h-0 bg-white mt-0">
                <iframe
                  srcDoc={output}
                  title="Code Preview"
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full border-0"
                />
              </TabsContent>
              <TabsContent value="output" className="flex-1 h-0 mt-0">
                <div className="p-4 h-full flex flex-col gap-2 flex-1">
                  <div className="flex-1 p-4 rounded-md bg-muted/50 font-code text-sm overflow-auto">
                    {history.length === 0 && !isExecuting && (
                      <pre className="whitespace-pre-wrap">
                        Click 'Run' to see the output.
                      </pre>
                    )}
                    {history.map((item, index) => (
                      <div key={index}>
                        {item.type === 'output' ? (
                          <pre className="whitespace-pre-wrap">
                            {item.content}
                          </pre>
                        ) : (
                          <pre className="whitespace-pre-wrap text-muted-foreground">
                            &gt; {item.content}
                          </pre>
                        )}
                      </div>
                    ))}
                    {isExecuting && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LoaderCircle className="w-5 h-5 animate-spin" />
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
                      disabled={isExecuting || selectedLanguage.isWeb}
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isExecuting || selectedLanguage.isWeb}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
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
                    {history.length === 0 && !isExecuting && (
                      <pre className="whitespace-pre-wrap">
                        Click 'Run Code' to see the output.
                      </pre>
                    )}
                    {history.map((item, index) => (
                      <div key={index}>
                        {item.type === 'output' ? (
                          <pre className="whitespace-pre-wrap">
                            {item.content}
                          </pre>
                        ) : (
                          <pre className="whitespace-pre-wrap text-muted-foreground">
                            &gt; {item.content}
                          </pre>
                        )}
                      </div>
                    ))}
                    {isExecuting && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LoaderCircle className="w-5 h-5 animate-spin" />
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
                      disabled={isExecuting || selectedLanguage.isWeb}
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isExecuting || selectedLanguage.isWeb}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
