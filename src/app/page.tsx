import PolyglotStudio from '@/components/polyglot-studio/polyglot-studio';
import { PolyglotStudioSidebar } from '@/components/polyglot-studio/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <PolyglotStudioSidebar />
      <SidebarInset>
        <main className="bg-background min-h-screen">
          <PolyglotStudio />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
