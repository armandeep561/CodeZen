
'use client';

import { useState, useCallback, useRef, FormEvent, useEffect } from 'react';
import {
  Download,
  Play,
  FileText,
  LoaderCircle,
  Send,
  Code,
  Files,
  Settings,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  languages,
  templates,
  type LanguageValue,
} from '@/lib/templates';
import { runCode } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileExplorer, type FileNode } from './file-explorer';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

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
    parentId: null,
    type: 'file'
  },
  {
    id: 'css:1',
    name: 'style.css',
    content: '/* Add your CSS here */',
    language: 'css',
    parentId: null,
    type: 'file'
  },
  {
    id: 'js:1',
    name: 'script.js',
    content: 'console.log("Hello from script.js!");',
    language: 'javascript',
    parentId: null,
    type: 'file'
  },
  {
    id: 'python:1',
    name: 'main.py',
    content: templates.python.code,
    language: 'python',
    parentId: null,
    type: 'file'
  },
];

type Panel = 'explorer' | 'search';

interface SearchResult {
  fileId: string;
  fileName: string;
  line: string;
  lineNumber: number;
}

export default function PolyglotStudio() {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [openFileIds, setOpenFileIds] = useState<string[]>(['html:1']);
  const [activeFileId, setActiveFileId] = useState<string | null>('html:1');

  const [activePanel, setActivePanel] = useState<Panel>('explorer');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

  const [output, setOutput] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const { toast } = useToast();
  const outputEndRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<{ start: number, end: number } | null>(null);

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
  const code = activeFile?.content ?? '';

  const getFullHtml = useCallback(() => {
    const htmlFile = files.find(f => f.name === 'index.html');
    if (!htmlFile) return '<h1>index.html not found</h1>';

    let htmlContent = htmlFile.content || '';

    const cssFile = files.find(f => f.name === 'style.css');
    if (cssFile && cssFile.content) {
      htmlContent = htmlContent.replace('</head>', `<style>${cssFile.content}</style></head>`);
    }

    const consoleInterceptor = `
      <script>
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        console.log = (...args) => {
          window.parent.postMessage({ type: 'console', level: 'log', args: args.map(a => String(a)) }, '*');
          originalLog.apply(console, args);
        };
        console.warn = (...args) => {
          window.parent.postMessage({ type: 'console', level: 'warn', args: args.map(a => String(a)) }, '*');
          originalWarn.apply(console, args);
        };
        console.error = (...args) => {
          window.parent.postMessage({ type: 'console', level: 'error', args: args.map(a => String(a)) }, '*');
          originalError.apply(console, args);
        };
      </script>
    `;
    htmlContent = htmlContent.replace('<head>', `<head>${consoleInterceptor}`);

    const jsFile = files.find(f => f.name === 'script.js');
    if (jsFile && jsFile.content) {
      htmlContent = htmlContent.replace('</body>', `<script>${jsFile.content}</script></body>`);
    }

    return htmlContent;
  }, [files]);


  useEffect(() => {
    if (selectedLanguage.isWeb) {
      const fullHtml = getFullHtml();
      setOutput(fullHtml);
    }
  }, [files, selectedLanguage.isWeb, getFullHtml]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'console') {
            const { level, args } = event.data;
            let content = args.join(' ');
            if (level === 'warn') {
                content = `[WARN] ${content}`;
            } else if (level === 'error') {
                content = `[ERROR] ${content}`;
            }
            setHistory(h => [...h, { type: 'output', content }]);
        }
    };

    window.addEventListener('message', handleMessage);

    return () => {
        window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (searchQuery) {
        const results: SearchResult[] = [];
        files.forEach(file => {
            if (file.type === 'file' && file.content) {
                const lines = file.content.split('\n');
                lines.forEach((line, index) => {
                    if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
                        results.push({
                            fileId: file.id,
                            fileName: file.name,
                            lineNumber: index + 1,
                            line: line.trim()
                        });
                    }
                });
            }
        });
        setSearchResults(results);
    } else {
        setSearchResults([]);
    }
  }, [searchQuery, files]);

  useEffect(() => {
    if (selection && editorRef.current) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(selection.start, selection.end);

        // Scroll into view
        const lines = editorRef.current.value.substring(0, selection.start).split('\n');
        const lineNumber = lines.length;
        const lineHeight = 19; // Approximate line height based on font-size and line-height
        editorRef.current.scrollTop = (lineNumber - 1) * lineHeight;
    }
  }, [selection]);


  const scrollToBottom = () => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const execute = useCallback(
    async (stdin?: string) => {
      if (!activeFile) return;

      if (selectedLanguage.isWeb) {
        setHistory([]);
        setOutput(getFullHtml());
        return;
      }

      setIsExecuting(true);
      if (stdin) {
        setHistory((prev) => [...prev, { type: 'input', content: stdin }]);
      } else {
        setHistory([]);
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
        setHistory((prev) => [
          ...prev,
          { type: 'output', content: 'Error executing code.' },
        ]);
      } finally {
        setIsExecuting(false);
        setTimeout(scrollToBottom, 100);
      }
    },
    [code, selectedLanguage, toast, history, activeFile, getFullHtml]
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
    const blob = new Blob([activeFile.content!], { type: 'text/plain' });
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
  
  const getFileLanguage = (fileName: string): LanguageValue => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return languages.find(l => l.extension === extension)?.value || 'plaintext' as any;
  }

  const handleFileCreate = (name: string, parentId: string | null) => {
    const newFile: FileNode = {
      id: `file:${Date.now()}`,
      name,
      content: ``,
      language: getFileLanguage(name),
      parentId,
      type: 'file',
    };
    setFiles((prev) => [...prev, newFile]);
    handleFileSelect(newFile.id);
  };

  const handleFolderCreate = (name: string, parentId: string | null) => {
      const newFolder: FileNode = {
          id: `folder:${Date.now()}`,
          name,
          type: 'folder',
          parentId,
          children: []
      };
      setFiles(prev => [...prev, newFolder]);
  }
  
  const deleteRecursively = (id: string, allFiles: FileNode[]): FileNode[] => {
      const fileToDelete = allFiles.find(f => f.id === id);
      if (!fileToDelete) return allFiles;

      let childrenIds: string[] = [];
      if (fileToDelete.type === 'folder') {
          childrenIds = allFiles.filter(f => f.parentId === id).map(f => f.id);
      }
      
      let remainingFiles = allFiles.filter(f => f.id !== id);
      childrenIds.forEach(childId => {
          remainingFiles = deleteRecursively(childId, remainingFiles);
      });
      
      return remainingFiles;
  }

  const handleFileDelete = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    
    // Close the tab if it's open
    setOpenFileIds(ids => ids.filter(id => id !== fileId));

    if (activeFileId === fileId) {
        const remainingOpen = openFileIds.filter(id => id !== fileId);
        setActiveFileId(remainingOpen.length > 0 ? remainingOpen[0] : null);
    }
  };

  const handleFolderDelete = (folderId: string) => {
      setFiles(prev => {
          const filesToDelete = new Set<string>([folderId]);
          const findChildren = (parentId: string) => {
              prev.forEach(file => {
                  if (file.parentId === parentId) {
                      filesToDelete.add(file.id);
                      if (file.type === 'folder') {
                          findChildren(file.id);
                      }
                  }
              });
          };
          findChildren(folderId);
          
          const openTabsInDeletedFolder = openFileIds.filter(id => filesToDelete.has(files.find(f => f.id === id)?.parentId || ''));
          setOpenFileIds(ids => ids.filter(id => !filesToDelete.has(id) && !openTabsInDeletedFolder.includes(id)));

          if (activeFileId && filesToDelete.has(activeFileId)) {
            const remainingOpen = openFileIds.filter(id => !filesToDelete.has(id));
            setActiveFileId(remainingOpen.length > 0 ? remainingOpen[0] : null);
          }
          
          return prev.filter(f => !filesToDelete.has(f.id));
      });
  }

  const handleRename = (id: string, newName: string) => {
      setFiles(prev => prev.map(f => f.id === id ? {...f, name: newName, language: f.type === 'file' ? getFileLanguage(newName) : f.language} : f));
  }

  const handleFileSelect = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file || file.type === 'folder') return;
    
    if (!openFileIds.includes(fileId)) {
        setOpenFileIds(prev => [...prev, fileId]);
    }
    setActiveFileId(fileId);
    setSelection(null); // Clear selection when changing files

    const lang = languages.find((l) => l.value === file.language);
    if (!lang?.isWeb) {
      setOutput('');
      setHistory([]);
    }
  };
  
  const handleCloseTab = (fileIdToClose: string) => {
    const newOpenFileIds = openFileIds.filter(id => id !== fileIdToClose);
    setOpenFileIds(newOpenFileIds);

    if (activeFileId === fileIdToClose) {
      if (newOpenFileIds.length > 0) {
        // Find index of closed tab to determine next active tab
        const closedTabIndex = openFileIds.findIndex(id => id === fileIdToClose);
        // Activate the previous tab, or the first one if the closed one was the first
        const newActiveIndex = Math.max(0, closedTabIndex - 1);
        setActiveFileId(newOpenFileIds[newActiveIndex]);
      } else {
        setActiveFileId(null);
      }
    }
  };

  const togglePanel = (panel: Panel) => {
    if (activePanel === panel) {
        setIsExplorerOpen(!isExplorerOpen);
    } else {
        setActivePanel(panel);
        setIsExplorerOpen(true);
    }
  }

  const handleSearchResultClick = (result: SearchResult) => {
    handleFileSelect(result.fileId);
    setActivePanel('explorer');

    const file = files.find(f => f.id === result.fileId);
    if(file && file.content) {
      const lines = file.content.split('\n');
      const lineIndex = result.lineNumber - 1;
      
      let start = 0;
      for(let i = 0; i < lineIndex; i++) {
        start += lines[i].length + 1; // +1 for the newline character
      }
      const end = start + lines[lineIndex].length;
      setSelection({ start, end });
    }
  }
  
  const SideBarButton = ({Icon, panel}: {Icon: LucideIcon, panel: Panel}) => (
     <Button variant={isExplorerOpen && activePanel === panel ? "secondary" : "ghost"} size="icon" onClick={() => togglePanel(panel)}>
        <Icon className="w-6 h-6" />
      </Button>
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex flex-col w-12 bg-card border-r items-center py-2 shrink-0">
        <SideBarButton Icon={Files} panel="explorer" />
        <SideBarButton Icon={Search} panel="search" />
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
            {activePanel === 'explorer' && (
                <>
                <div className="p-2 border-b">
                    <h2 className="text-sm font-semibold tracking-widest uppercase">Explorer</h2>
                </div>
                <ScrollArea className="flex-1">
                <FileExplorer
                    files={files}
                    onFileSelect={handleFileSelect}
                    onFileCreate={handleFileCreate}
                    onFolderCreate={handleFolderCreate}
                    onFileDelete={handleFileDelete}
                    onFolderDelete={handleFolderDelete}
                    onRename={handleRename}
                />
                </ScrollArea>
                </>
            )}
             {activePanel === 'search' && (
                <div className="p-4 flex flex-col gap-4 h-full">
                    <h2 className="text-lg font-semibold">Search</h2>
                    <Input 
                      placeholder="Search across all files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <ScrollArea className="flex-1">
                      <div className="flex flex-col gap-2">
                        {searchResults.length > 0 ? (
                          searchResults.map((result, index) => (
                            <button 
                              key={index} 
                              className="text-left p-2 rounded-md hover:bg-accent/50 text-sm"
                              onClick={() => handleSearchResultClick(result)}
                            >
                                <div className="font-semibold text-primary">{result.fileName}</div>
                                <div className="text-muted-foreground text-xs">Line {result.lineNumber}</div>
                                <div className="font-code text-accent-foreground truncate">{result.line}</div>
                            </button>
                          ))
                        ) : (
                          searchQuery && <p className="text-sm text-muted-foreground text-center p-4">No results found.</p>
                        )}
                      </div>
                    </ScrollArea>
                </div>
            )}
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
              {openFileIds.map(fileId => {
                  const file = files.find(f => f.id === fileId);
                  if(!file) return null;
                  return (
                    <div
                        key={fileId}
                        onClick={() => setActiveFileId(fileId)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 border-r cursor-pointer",
                            activeFileId === fileId ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                        )}
                    >
                    <FileText className="w-4 h-4" />
                    <span>{file.name}</span>
                    <Button variant="ghost" size="icon" className="w-6 h-6 -mr-2" onClick={(e) => { e.stopPropagation(); handleCloseTab(fileId)}}>
                        <X className="w-4 h-4"/>
                    </Button>
                    </div>
                  )
              })}
            </div>
            <div className="flex-1 relative">
                 <Textarea
                    ref={editorRef}
                    value={activeFileId ? code : ''}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Select a file to start coding, or create a new one."
                    className="absolute inset-0 w-full h-full resize-none font-code bg-transparent text-gray-100 rounded-none border-0 focus-visible:ring-0 p-4 text-sm"
                    disabled={!activeFile}
                />
            </div>
          </div>
          
          <div className="flex flex-col h-full border-l">
             <Tabs defaultValue="preview" className="flex flex-col h-full">
                <div className="flex-shrink-0 border-b">
                    <TabsList className="bg-transparent rounded-none p-0 m-0">
                        <TabsTrigger value="preview" className="h-full rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 border-accent">Preview</TabsTrigger>
                        <TabsTrigger value="console" className="h-full rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 border-accent">Console</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="preview" className="flex-1 bg-white">
                     <iframe
                        srcDoc={output}
                        title="Code Preview"
                        sandbox="allow-scripts allow-modals"
                        className="w-full h-full border-0"
                    />
                </TabsContent>
                <TabsContent value="console" className="flex-1 bg-card text-card-foreground">
                    <div className="p-4 h-full flex flex-col gap-2 flex-1">
                        <div className="flex-1 p-4 rounded-md bg-muted/50 font-code text-sm overflow-auto">
                            {history.length === 0 && !isExecuting && (
                            <pre className="whitespace-pre-wrap text-muted-foreground">
                                Console output will appear here. Click 'Run' to execute your code.
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
                            {isExecuting && !selectedLanguage.isWeb && (
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
          </div>
        </div>
      </div>
    </div>
  );
}
