import PolyglotStudio from '@/components/polyglot-studio/polyglot-studio';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <main className="bg-background min-h-screen">
        <PolyglotStudio />
      </main>
    </SidebarProvider>
  );
}
