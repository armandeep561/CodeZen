'use client';

import { Files, Search, Settings, Moon, Code, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PolyglotStudioSidebar() {
  return (
    <div className="flex flex-col w-12 bg-card border-r items-center py-2 shrink-0">
        <Button variant="ghost" size="icon">
          <Files className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <Search className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon">
            <GitBranch className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon">
            <Code className="w-6 h-6" />
        </Button>
        <div className="mt-auto flex flex-col items-center">
             <Button variant="ghost" size="icon">
                <Settings className="w-6 h-6" />
            </Button>
             <Button variant="ghost" size="icon">
                <Moon className="w-6 h-6" />
             </Button>
        </div>
      </div>
  );
}
