import PolyglotStudio from '@/components/polyglot-studio/polyglot-studio';
import { PolyglotStudioSidebar } from '@/components/polyglot-studio/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <PolyglotStudioSidebar />
      <div className="flex flex-col w-full">
         <header className="flex h-12 items-center px-4 border-b shrink-0">
           <h1 className="text-xl font-bold font-headline">codezen</h1>
         </header>
        <main className="flex-1">
          <PolyglotStudio />
        </main>
      </div>
    </SidebarProvider>
  );
}
