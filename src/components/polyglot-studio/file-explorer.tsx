
'use client';

import { Plus, Trash2, ChevronDown, Folder, FolderPlus, Edit, Check, X, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LanguageValue } from '@/lib/templates';
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { LanguageIcon } from './language-icon';

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
  onFolderCreate: (name: string, parentId: string | null) => void;
  onFileDelete: (id: string) => void;
  onFolderDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  newEntry: { parentId: string | null, type: 'file' | 'folder' } | null;
  setNewEntry: (entry: { parentId: string | null, type: 'file' | 'folder' } | null) => void;
}

export function FileExplorer({
  files,
  onFileSelect,
  onFileCreate,
  onFolderCreate,
  onFileDelete,
  onFolderDelete,
  onRename,
  newEntry,
  setNewEntry
}: FileExplorerProps) {
  
  const handleCreate = (name: string) => {
    if(!newEntry) return;

    if (newEntry.type === 'file') {
      onFileCreate(name, newEntry.parentId);
    } else if (newEntry.type === 'folder') {
      onFolderCreate(name, newEntry.parentId);
    }
    setNewEntry(null);
  };
  
  const fileTree = React.useMemo(() => {
    const tree: FileNode[] = [];
    const map: { [key: string]: FileNode & { children: FileNode[] } } = {};
    
    files.forEach(file => {
      map[file.id] = { ...file, children: file.type === 'folder' ? [] : undefined } as FileNode & { children: FileNode[] };
    });

    files.forEach(file => {
      if (file.parentId && map[file.parentId]) {
        if(map[file.parentId].children) {
            map[file.parentId].children.push(map[file.id]);
        }
      } else {
        tree.push(map[file.id]);
      }
    });
    
    const sortNodes = (nodes: FileNode[]) => {
      return nodes.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    };

    Object.values(map).forEach(node => {
      if (node.children) {
        node.children = sortNodes(node.children);
      }
    });

    return sortNodes(tree);
  }, [files]);

  return (
    <div className="p-2 h-full flex flex-col text-sm">
      <ul className="flex-1">
        {fileTree.map((node) => (
          <FileOrFolder
            key={node.id}
            node={node}
            onFileSelect={onFileSelect}
            onFileDelete={onFileDelete}
            onFolderDelete={onFolderDelete}
            onRename={onRename}
            setNewEntry={setNewEntry}
            newEntry={newEntry}
            onFileCreate={onFileCreate}
            onFolderCreate={onFolderCreate}
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
  onFolderDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  setNewEntry: (entry: { parentId: string | null, type: 'file' | 'folder' } | null) => void;
  newEntry: { parentId: string | null, type: 'file' | 'folder' } | null;
  onFileCreate: (name: string, parentId: string | null) => void;
  onFolderCreate: (name: string, parentId: string | null) => void;
}

function FileOrFolder({ node, onFileSelect, onFileDelete, onFolderDelete, onRename, setNewEntry, newEntry, onFileCreate, onFolderCreate }: FileOrFolderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const handleRename = () => {
    if(newName.trim() && newName.trim() !== node.name) {
      onRename(node.id, newName);
    }
    setIsRenaming(false);
  }
  
  const handleCreate = (name: string) => {
    if(!newEntry) return;

    if (newEntry.type === 'file') {
       onFileCreate(name, newEntry.parentId);
    } else if (newEntry.type === 'folder') {
       onFolderCreate(name, newEntry.parentId);
    }
    setNewEntry(null);
  };


  if (node.type === 'folder') {
    return (
      <li>
        <div className="flex items-center group w-full text-left px-2 py-1 rounded-md hover:bg-accent/50">
          <button className="flex items-center flex-1" onClick={() => setIsOpen(!isOpen)}>
            <ChevronDown className={cn("w-4 h-4 mr-1 transition-transform", !isOpen && "-rotate-90")} />
            <Folder className="w-4 h-4 mr-2" />
            {!isRenaming ? (
              <span className="truncate">{node.name}</span>
            ) : (
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if(e.key === 'Escape') setIsRenaming(false) }}
                autoFocus
                className="h-6"
              />
            )}
          </button>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setNewEntry({ parentId: node.id, type: 'folder' })}>
                <FolderPlus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setNewEntry({ parentId: node.id, type: 'file' })}>
                <FilePlus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setIsRenaming(true)}><Edit className="w-4 h-4"/></Button>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => onFolderDelete(node.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
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
                onFolderDelete={onFolderDelete}
                onRename={onRename}
                setNewEntry={setNewEntry}
                newEntry={newEntry}
                onFileCreate={onFileCreate}
                onFolderCreate={onFolderCreate}
              />
            ))}
            {newEntry && newEntry.parentId === node.id && (
              <NewEntryInput
                 type={newEntry.type}
                 onCreate={handleCreate}
                 onCancel={() => setNewEntry(null)}
              />
            )}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="group">
      <div className="flex items-center w-full rounded-md hover:bg-accent/50 pr-1">
         <Button
            variant="ghost"
            className={cn(
            'w-full justify-start h-8 px-2 flex-1',
            )}
            onClick={() => onFileSelect(node.id)}
        >
          <LanguageIcon language={node.language} fileName={node.name} />
          {!isRenaming ? (
            <span className="flex-1 truncate text-left">{node.name}</span>
          ) : (
             <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if(e.key === 'Escape') setIsRenaming(false)}}
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
    if (name.trim()) {
      onCreate(name.trim());
    } else {
      onCancel();
    }
  };

  return (
    <li className="flex items-center gap-1 p-1">
      {type === 'folder' ? <Folder className="w-4 h-4 mr-2"/> : <LanguageIcon fileName={name} />}
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
        onBlur={handleSubmit}
      />
    </li>
  )
}
