
'use client';

import { useState, useCallback, useRef, FormEvent, useEffect } from 'react';
import {
  FileText,
  LoaderCircle,
  Send,
  Code,
  Files,
  Search,
  X,
  type LucideIcon,
  Download,
  Play,
  FolderPlus,
  FilePlus,
  PanelLeft,
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
import { Separator } from '../ui/separator';

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
type ActiveView = 'editor' | 'output';
type OutputTab = 'preview' | 'console';

interface SearchResult {
  fileId: string;
  fileName: string;
  line: string;
  lineNumber: number;
}

const MainContent = ({
  activeView,
  activeOutputTab,
  setActiveOutputTab,
  output,
  history,
  isExecuting,
  selectedLanguage,
  outputEndRef,
  handleUserInputSubmit,
  userInput,
  setUserInput,
  editorRef,
  activeFileId,
  code,
  setCode,
  activeFile,
}) => {
  if (activeView === 'output') {
    return (
      <Tabs value={activeOutputTab} onValueChange={(value) => setActiveOutputTab(value as OutputTab)} className="flex flex-col h-full">
          <TabsContent value="preview" className="flex-1 bg-white m-0">
                <iframe
                  srcDoc={output}
                  title="Code Preview"
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full border-0"
              />
          </TabsContent>
          <TabsContent value="console" className="flex-1 bg-card text-card-foreground m-0">
              <div className="p-4 h-full flex flex-col gap-2 flex-1">
                  <ScrollArea className="flex-1 p-4 rounded-md bg-muted/50 font-code text-sm">
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
                  </ScrollArea>
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
    );
  }

  return (
    <div className="flex-1 relative h-full">
      <Textarea
        ref={editorRef}
        value={activeFileId ? code : ''}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Select a file to start coding, or create a new one."
        className="absolute inset-0 w-full h-full resize-none font-code bg-transparent text-gray-100 rounded-none border-0 focus-visible:ring-0 p-4 text-sm"
        disabled={!activeFile}
      />
    </div>
  );
};


export default function PolyglotStudio() {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [openFileIds, setOpenFileIds] = useState<string[]>(['html:1']);
  const [activeFileId, setActiveFileId] = useState<string | null>('html:1');

  const [activePanel, setActivePanel] = useState<Panel>('explorer');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

  const [activeView, setActiveView] = useState<ActiveView>('editor');
  const [activeOutputTab, setActiveOutputTab] = useState<OutputTab>('preview');

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

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [newEntry, setNewEntry] = useState<{ parentId: string | null, type: 'file' | 'folder' } | null>(null);


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
    const htmlFile = files.find(f => f.language === 'html');
    if (!htmlFile) return '<h1>No HTML file found to display.</h1><p>Please create an HTML file (e.g., index.html) to see a preview.</p>';

    let htmlContent = htmlFile.content || '';

    // Create a map of file names to content for quick lookup
    const fileContentMap = new Map(files.map(f => [f.name, f.content]));

    // Inject CSS
    const cssLinkRegex = /<link\s+[^>]*?href="([^"]+)"[^>]*?rel="stylesheet"[^>]*?>/g;
    htmlContent = htmlContent.replace(cssLinkRegex, (match, href) => {
      const cssContent = fileContentMap.get(href);
      return cssContent ? `<style>${cssContent}</style>` : match;
    });
    
    // Inject JS
    const scriptTagRegex = /<script\s+[^>]*?src="([^"]+)"[^>]*?>\s*<\/script>/g;
    htmlContent = htmlContent.replace(scriptTagRegex, (match, src) => {
      const jsContent = fileContentMap.get(src);
      return jsContent ? `<script>${jsContent}</script>` : match;
    });

    // Inject console interceptor
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
    if (htmlContent.includes('<head>')) {
      htmlContent = htmlContent.replace('<head>', `<head>${consoleInterceptor}`);
    } else {
      htmlContent = consoleInterceptor + htmlContent;
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

        const lines = editorRef.current.value.substring(0, selection.start).split('\n');
        const lineNumber = lines.length;
        const lineHeight = 19; 
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
  
  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };


  const handleUserInputSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isExecuting) return;
    execute(userInput.trim());
  };
  
  const getFileLanguage = (fileName: string): LanguageValue => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return languages.find(l => l.extension === extension)?.value || 'plaintext' as any;
  }

  const handleCreate = (name: string) => {
    if (!newEntry) return;

    if (newEntry.type === 'file') {
      handleFileCreate(name, newEntry.parentId);
    } else if (newEntry.type === 'folder') {
      handleFolderCreate(name, newEntry.parentId);
    }
    setNewEntry(null);
  };


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
    setActiveView('editor');
    setSelection(null); 

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
        const closedTabIndex = openFileIds.findIndex(id => id === fileIdToClose);
        const newActiveIndex = Math.max(0, closedTabIndex - 1);
        setActiveFileId(newOpenFileIds[newActiveIndex]);
      } else {
        setActiveFileId(null);
        setActiveView('output'); 
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
    setActiveView('editor');

    const file = files.find(f => f.id === result.fileId);
    if(file && file.content) {
      const lines = file.content.split('\n');
      const lineIndex = result.lineNumber - 1;
      
      let start = 0;
      for(let i = 0; i < lineIndex; i++) {
        start += lines[i].length + 1; 
      }
      const end = start + lines[lineIndex].length;
      setSelection({ start, end });
    }
  }
  
  const SideBarButton = ({Icon, panel}: {Icon: LucideIcon, panel: Panel}) => (
     <Button variant={isExplorerOpen && activePanel === panel ? "secondary" : "ghost"} size="icon" className="h-12 w-12" onClick={() => togglePanel(panel)}>
        <Icon className="w-6 h-6" />
      </Button>
  )

  const handleWheelScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = tabsContainerRef.current;
    if (container) {
      container.scrollLeft += event.deltaY;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-body">
      <div className="flex flex-col w-14 bg-card border-r items-center py-2 shrink-0">
         <a href="#" className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-4.44h.001c-1.43.04-2.8.54-3.92 1.45A5.05 5.05 0 0 0 2.2 7.3V12a5.05 5.05 0 0 0 1.66 3.75c1.12.9 2.5 1.4 3.92 1.45h.001h4.44c1.43-.04 2.8-.54 3.92-1.45A5.05 5.05 0 0 0 17.8 12V7.3a5.05 5.05 0 0 0-1.66-3.75C15.02 2.54 13.65 2.04 12.22 2Z"/><path d="M6.26 6.26 12.5 12.5l6.24-6.24"/><path d="m12.5 12.5-6.24 6.24 6.24 6.24"/></svg>
         </a>
        <SideBarButton Icon={Files} panel="explorer" />
        <SideBarButton Icon={Search} panel="search" />
        <Button variant="ghost" size="icon" className="h-12 w-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hexagon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        </Button>
        <div className="mt-auto flex flex-col items-center">
            <Button variant="ghost" size="icon" className="h-12 w-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
            </Button>
             <Button variant="ghost" size="icon" className="h-12 w-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
             </Button>
        </div>
      </div>
      
      {isExplorerOpen && (
        <div className="w-64 bg-card border-r flex flex-col shrink-0">
            <div className="p-2 border-b h-12 flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-widest uppercase">{activePanel === 'explorer' ? 'Explorer' : 'Search'}</h2>
                 {activePanel === 'explorer' && (
                    <div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNewEntry({parentId: null, type: 'folder'})}>
                            <FolderPlus className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNewEntry({parentId: null, type: 'file'})}>
                            <FilePlus className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
            {activePanel === 'explorer' && (
                <>
                  <ScrollArea className="flex-1">
                  <FileExplorer
                      files={files}
                      onFileSelect={handleFileSelect}
                      onFileCreate={handleCreate}
                      onFolderCreate={handleCreate}
                      onFileDelete={handleFileDelete}
                      onFolderDelete={handleFolderDelete}
                      onRename={handleRename}
                      newEntry={newEntry}
                      setNewEntry={setNewEntry}
                  />
                  </ScrollArea>
                </>
            )}
             {activePanel === 'search' && (
                <div className="p-4 flex flex-col gap-4 h-full">
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
         <div className="flex items-center border-b h-12 pr-4 bg-card">
              <div
                ref={tabsContainerRef}
                className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar whitespace-nowrap"
                onWheel={handleWheelScroll}
              >
                 {openFileIds.map(fileId => {
                  const file = files.find(f => f.id === fileId);
                  if (!file) return null;
                  return (
                    <div
                      key={fileId}
                      onClick={() => {
                        handleFileSelect(fileId);
                        setActiveView('editor');
                      }}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 border-r cursor-pointer h-12',
                        activeFileId === fileId && activeView === 'editor'
                          ? 'bg-background'
                          : 'hover:bg-accent/50'
                      )}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 -mr-2 rounded-full"
                        onClick={e => {
                          e.stopPropagation();
                          handleCloseTab(fileId);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 ml-auto pl-4">
                  <Button variant="secondary" size="sm" onClick={handleDownload} disabled={!activeFile}>
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button size="sm" onClick={() => execute()} disabled={isExecuting}>
                    <Play className="w-4 h-4" />
                    Run
                  </Button>
              </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0">
            <div className="flex flex-col h-full bg-background relative">
               <MainContent
                  activeView={activeView}
                  activeOutputTab={activeOutputTab}
                  setActiveOutputTab={setActiveOutputTab}
                  output={output}
                  history={history}
                  isExecuting={isExecuting}
                  selectedLanguage={selectedLanguage}
                  outputEndRef={outputEndRef}
                  handleUserInputSubmit={handleUserInputSubmit}
                  userInput={userInput}
                  setUserInput={setUserInput}
                  editorRef={editorRef}
                  activeFileId={activeFileId}
                  code={code}
                  setCode={setCode}
                  activeFile={activeFile}
               />
            </div>
            
            <div className="flex flex-col h-full border-l bg-card">
              <Tabs value={activeOutputTab} onValueChange={(value) => setActiveOutputTab(value as OutputTab)} className="flex flex-col h-full">
                  <div className="flex-shrink-0 border-b h-12">
                      <TabsList className="bg-transparent rounded-none p-0 m-0 h-full">
                          <TabsTrigger value="preview" className="h-full rounded-none data-[state=active]:shadow-none data-[state=active]:bg-background data-[state=active]:border-b-2 border-primary">Preview</TabsTrigger>
                          <TabsTrigger value="console" className="h-full rounded-none data-[state=active]:shadow-none data-[state=active]:bg-background data-[state=active]:border-b-2 border-primary">Console</TabsTrigger>
                      </TabsList>
                  </div>
                  <TabsContent value="preview" className="flex-1 bg-white m-0">
                      <iframe
                          srcDoc={output}
                          title="Code Preview"
                          sandbox="allow-scripts allow-modals"
                          className="w-full h-full border-0"
                      />
                  </TabsContent>
                  <TabsContent value="console" className="flex-1 bg-card text-card-foreground m-0">
                      <div className="p-4 h-full flex flex-col gap-2">
                          <ScrollArea className="flex-1 p-4 rounded-md bg-muted/50 font-code text-sm">
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
                          </ScrollArea>
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
