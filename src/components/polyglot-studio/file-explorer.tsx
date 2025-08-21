'use client';

import { File, Plus, Trash2, Code, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LanguageValue } from '@/lib/templates';

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
  return (
    <div className="p-2 h-full flex flex-col">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-sm">Files</h3>
          <Button variant="ghost" size="icon" onClick={onFileCreate}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  file.id === activeFileId && 'bg-accent text-accent-foreground'
                )}
                onClick={() => onFileSelect(file.id)}
              >
                <FileText className="w-4 h-4 mr-2" />
                <span className="flex-1 truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 ml-2 hover:bg-destructive/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileDelete(file.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
