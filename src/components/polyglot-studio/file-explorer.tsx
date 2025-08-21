'use client';

import { FileText, Plus, Trash2, ChevronDown, Folder, FolderPlus, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LanguageValue } from '@/lib/templates';
import React, { useState } from 'react';
import { Input } from '../ui/input';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: LanguageValue;
  content?: string;
  children?: FileNode[];
  parentId?: string | null;
}


interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (id: string) => void;
  onFileCreate: (name: string, parentId: string | null) => void;
  onFileDelete: (id: string) => void;
  onFolderCreate: (name: string, parentId: string | null) => void;
  onRename: (id: string, newName: string) => void;
}

export function FileExplorer({
  files,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFolderCreate,
  onRename
}: FileExplorerProps) {
  
  const [newEntry, setNewEntry] = useState<{ parentId: string | null, type: 'file' | 'folder' } | null>(null);

  const handleCreate = (name: string) => {
    if (newEntry?.type === 'file') {
      onFileCreate(name, newEntry.parentId);
    } else if (newEntry?.type === 'folder') {
      onFolderCreate(name, newEntry.parentId);
    }
    setNewEntry(null);
  };
  
  const fileTree = React.useMemo(() => {
    const tree: FileNode[] = [];
    const map: { [key: string]: FileNode } = {};
    
    files.forEach(file => {
      map[file.id] = { ...file, children: file.type === 'folder' ? [] : undefined };
    });

    files.forEach(file => {
      if (file.parentId && map[file.parentId]) {
        map[file.parentId].children?.push(map[file.id]);
      } else {
        tree.push(map[file.id]);
      }
    });

    return tree;
  }, [files]);

  return (
    <div className="p-2 h-full flex flex-col text-sm">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="font-semibold">Files</h3>
        <div>
           <Button variant="ghost" size="icon" onClick={() => setNewEntry({parentId: null, type: 'folder'})}>
              <FolderPlus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setNewEntry({parentId: null, type: 'file'})}>
                <Plus className="w-4 h-4" />
            </Button>
        </div>
      </div>
      <ul className="flex-1">
        {fileTree.map((node) => (
          <FileOrFolder
            key={node.id}
            node={node}
            onFileSelect={onFileSelect}
            onFileDelete={onFileDelete}
            onRename={onRename}
            onSetNewEntry={setNewEntry}
          />
        ))}
        {newEntry && !newEntry.parentId && (
          <NewEntryInput
            type={newEntry.type}
            onCreate={handleCreate}
            onCancel={() => setNewEntry(null)}
          />
        )}
      </ul>
    </div>
  );
}

interface FileOrFolderProps {
  node: FileNode;
  onFileSelect: (id: string) => void;
  onFileDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onSetNewEntry: (entry: { parentId: string | null, type: 'file' | 'folder' } | null) => void;
}

function FileOrFolder({ node, onFileSelect, onFileDelete, onRename, onSetNewEntry }: FileOrFolderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const handleRename = () => {
    onRename(node.id, newName);
    setIsRenaming(false);
  }

  if (node.type === 'folder') {
    return (
      <li>
        <div className="flex items-center group w-full text-left px-2 py-1">
          <button className="flex items-center flex-1" onClick={() => setIsOpen(!isOpen)}>
            <ChevronDown className={cn("w-4 h-4 mr-1 transition-transform", !isOpen && "-rotate-90")} />
            <Folder className="w-4 h-4 mr-2" />
            {!isRenaming ? (
              <span>{node.name}</span>
            ) : (
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
                className="h-6"
              />
            )}
          </button>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => onSetNewEntry({ parentId: node.id, type: 'folder' })}>
                <FolderPlus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => onSetNewEntry({ parentId: node.id, type: 'file' })}>
                <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setIsRenaming(true)}><Edit className="w-4 h-4"/></Button>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => onFileDelete(node.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
          </div>
        </div>
        {isOpen && (
          <ul className="pl-4">
            {node.children?.map(child => (
              <FileOrFolder
                key={child.id}
                node={child}
                onFileSelect={onFileSelect}
                onFileDelete={onFileDelete}
                onRename={onRename}
                onSetNewEntry={onSetNewEntry}
              />
            ))}
            {onSetNewEntry.arguments?.parentId === node.id && (
              <NewEntryInput
                 type={'file'}
                 onCreate={() => {}}
                 onCancel={() => onSetNewEntry(null)}
              />
            )}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="group">
      <div className="flex items-center w-full">
         <Button
            variant="ghost"
            className={cn(
            'w-full justify-start h-8 px-2 flex-1',
            )}
            onClick={() => onFileSelect(node.id)}
        >
          <FileText className="w-4 h-4 mr-2" />
          {!isRenaming ? (
            <span className="flex-1 truncate">{node.name}</span>
          ) : (
             <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
                className="h-6"
              />
          )}
        </Button>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setIsRenaming(true)}><Edit className="w-4 h-4"/></Button>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => onFileDelete(node.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
        </div>
      </div>
    </li>
  );
}

interface NewEntryInputProps {
  type: 'file' | 'folder';
  onCreate: (name: string) => void;
  onCancel: () => void;
}

function NewEntryInput({ type, onCreate, onCancel }: NewEntryInputProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name) {
      onCreate(name);
    } else {
      onCancel();
    }
  };

  return (
    <li className="flex items-center gap-1 p-1">
      {type === 'folder' ? <Folder className="w-4 h-4"/> : <FileText className="w-4 h-4"/>}
      <Input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={`New ${type} name...`}
        className="h-6 flex-1"
        autoFocus
        onKeyDown={e => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onCancel();
        }}
        onBlur={onCancel}
      />
    </li>
  )
}
