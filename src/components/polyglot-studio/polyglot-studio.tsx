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
  X,
  ChevronDown,
  Folder,
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
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

  const [output, setOutput] = useState<string>(templates.html.code);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const { toast } = useToast();
  const outputEndRef = useRef<HTMLDivElement>(null);

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

  const activeTabs = files.filter(f => f.id === activeFileId);

  useEffect(() => {
    if (activeFile?.language && languages.find(l => l.value === activeFile.language)?.isWeb) {
      setOutput(code);
    }
  }, [code, activeFile?.language]);


  const scrollToBottom = () => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        return;
      }

      setIsExecuting(true);
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
      const remainingFiles = files.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
  };

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId);
    const file = files.find((f) => f.id === fileId);
    if (file) {
      const lang = languages.find((l) => l.value === file.language);
      if (lang?.isWeb) {
        setOutput(file.content);
      } else {
        setOutput('');
        setHistory([]);
      }
    }
  };
  
  const handleCloseTab = (fileId: string) => {
    if (activeFileId === fileId) {
      const currentIndex = files.findIndex(f => f.id === fileId);
      let nextActiveId = null;
      if (files.length > 1) {
        nextActiveId = files[currentIndex - 1]?.id || files[currentIndex + 1]?.id || null;
      }
      setActiveFileId(nextActiveId);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex flex-col w-12 bg-card border-r items-center py-2 shrink-0">
        <Button variant={isExplorerOpen ? "secondary" : "ghost"} size="icon" onClick={() => setIsExplorerOpen(!isExplorerOpen)}>
          <Files className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <Search className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <Code className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="w-6 h-6" />
        </Button>
        <div className="mt-auto flex flex-col items-center">
            <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
            </Button>
             <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
             </Button>
        </div>
      </div>
      
      {isExplorerOpen && (
        <div className="w-64 bg-card border-r flex flex-col shrink-0">
           <div className="p-2 border-b">
                <h2 className="text-sm font-semibold tracking-widest uppercase">Explorer</h2>
            </div>
            <ScrollArea className="flex-1">
              <FileExplorer
                files={files}
                activeFileId={activeFileId}
                onFileSelect={handleFileSelect}
                onFileCreate={handleFileCreate}
                onFileDelete={handleFileDelete}
              />
            </ScrollArea>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
         <header className="flex h-12 items-center px-4 border-b shrink-0 justify-between">
            <h1 className="text-xl font-bold font-headline">codezen</h1>
            <div className="flex items-center gap-2">
                <Button onClick={handleRunCode} disabled={isExecuting || !activeFile}>
                    <Play className="mr-2 h-4 w-4" /> Run
                </Button>
                 <Button onClick={handleDownload} variant="ghost" disabled={!activeFile}>
                    <Download className="mr-2 h-4 w-4" /> Download
                </Button>
            </div>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center border-b border-t">
              {activeFileId && (
                <div
                  className="flex items-center gap-2 px-4 py-2 border-r bg-accent text-accent-foreground"
                >
                  <FileText className="w-4 h-4" />
                  <span>{activeFile?.name}</span>
                  <Button variant="ghost" size="icon" className="w-6 h-6 -mr-2" onClick={() => handleCloseTab(activeFileId)}>
                    <X className="w-4 h-4"/>
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 relative">
                 <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Select a file to start coding, or create a new one."
                    className="absolute inset-0 w-full h-full resize-none font-code bg-transparent text-gray-100 rounded-none border-0 focus-visible:ring-0 p-4 text-sm"
                    disabled={!activeFile}
                />
            </div>
          </div>
          
          <div className="flex flex-col h-full border-l">
            <div className="flex items-center border-b p-2">
                <Tabs defaultValue="preview" className="w-full">
                    <TabsList>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="console">Console</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="flex-1 bg-white">
                {selectedLanguage.isWeb ? (
                     <iframe
                        srcDoc={output}
                        title="Code Preview"
                        sandbox="allow-scripts allow-modals"
                        className="w-full h-full border-0"
                    />
                ) : (
                    <div className="p-4 h-full flex flex-col gap-2 flex-1 bg-card text-card-foreground">
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
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
