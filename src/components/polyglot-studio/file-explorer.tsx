'use client';

import { FileText, Plus, Trash2, ChevronDown, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LanguageValue } from '@/lib/templates';
import { useState } from 'react';

export interface FileNode {
  id: string;
  name: string;
  language: LanguageValue;
  content: string;
}

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onFileSelect: (id: string) => void;
  onFileCreate: () => void;
  onFileDelete: (id: string) => void;
}

export function FileExplorer({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
}: FileExplorerProps) {
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(['css', 'js']));

  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => {
        const newSet = new Set(prev);
        if (newSet.has(folder)) {
            newSet.delete(folder);
        } else {
            newSet.add(folder);
        }
        return newSet;
    });
  }

  // NOTE: This is a simplified folder structure for presentation based on file extensions.
  const folders: Record<string, FileNode[]> = files.reduce((acc, file) => {
    const extension = file.name.split('.').pop() || 'txt';
    let folderName = 'files';
    if (['html', 'css', 'js'].includes(extension)) {
        folderName = extension === 'html' ? 'root' : (extension === 'css' ? 'css' : 'js');
    }
    if (!acc[folderName]) {
      acc[folderName] = [];
    }
    acc[folderName].push(file);
    return acc;
  }, {} as Record<string, FileNode[]>);

  const rootFiles = folders['root'] || [];
  const cssFiles = folders['css'] || [];
  const jsFiles = folders['js'] || [];
  const otherFiles = Object.entries(folders).filter(([key]) => !['root', 'css', 'js'].includes(key)).flatMap(([, files]) => files);


  return (
    <div className="p-2 h-full flex flex-col text-sm">
        <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="font-semibold">Files</h3>
            <Button variant="ghost" size="icon" onClick={onFileCreate}>
                <Plus className="w-4 h-4" />
            </Button>
        </div>
        <ul className="flex-1">
            {rootFiles.map((file) => (
                 <li key={file.id}>
                    <FileItem 
                        file={file} 
                        isActive={file.id === activeFileId} 
                        onSelect={onFileSelect}
                        onDelete={onFileDelete}
                    />
                 </li>
            ))}

            {/* CSS Folder */}
            {cssFiles.length > 0 && (
                 <li>
                    <button className="flex items-center w-full text-left px-2 py-1" onClick={() => toggleFolder('css')}>
                        <ChevronDown className={cn("w-4 h-4 mr-1 transition-transform", !openFolders.has('css') && "-rotate-90")} />
                        <Folder className="w-4 h-4 mr-2" />
                        css
                    </button>
                    {openFolders.has('css') && (
                        <ul className="pl-4">
                            {cssFiles.map(file => (
                                 <li key={file.id}>
                                     <FileItem 
                                        file={file} 
                                        isActive={file.id === activeFileId} 
                                        onSelect={onFileSelect}
                                        onDelete={onFileDelete}
                                    />
                                 </li>
                            ))}
                        </ul>
                    )}
                 </li>
            )}
            
            {/* JS Folder */}
            {jsFiles.length > 0 && (
                <li>
                    <button className="flex items-center w-full text-left px-2 py-1" onClick={() => toggleFolder('js')}>
                        <ChevronDown className={cn("w-4 h-4 mr-1 transition-transform", !openFolders.has('js') && "-rotate-90")} />
                        <Folder className="w-4 h-4 mr-2" />
                        js
                    </button>
                    {openFolders.has('js') && (
                        <ul className="pl-4">
                            {jsFiles.map(file => (
                                 <li key={file.id}>
                                     <FileItem 
                                        file={file} 
                                        isActive={file.id === activeFileId} 
                                        onSelect={onFileSelect}
                                        onDelete={onFileDelete}
                                    />
                                 </li>
                            ))}
                        </ul>
                    )}
                 </li>
            )}

            {otherFiles.map((file) => (
                 <li key={file.id}>
                    <FileItem 
                        file={file} 
                        isActive={file.id === activeFileId} 
                        onSelect={onFileSelect}
                        onDelete={onFileDelete}
                    />
                 </li>
            ))}

        </ul>
    </div>
  );
}


interface FileItemProps {
    file: FileNode;
    isActive: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}
function FileItem({ file, isActive, onSelect, onDelete }: FileItemProps) {
    return (
        <Button
            variant="ghost"
            className={cn(
            'w-full justify-start h-8 px-2',
            isActive && 'bg-accent text-accent-foreground'
            )}
            onClick={() => onSelect(file.id)}
        >
            <FileText className="w-4 h-4 mr-2" />
            <span className="flex-1 truncate">{file.name}</span>
            <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 ml-2 hover:bg-destructive/20 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
                e.stopPropagation();
                onDelete(file.id);
            }}
            >
            <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
        </Button>
    )
}
