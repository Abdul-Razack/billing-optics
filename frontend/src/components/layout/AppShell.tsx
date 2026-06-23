import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-[100dvh] flex w-full bg-background overflow-hidden">
      <div className="hidden md:flex flex-col flex-shrink-0 h-full print:hidden">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
        <div className="print:hidden"><Header /></div>
        <main className="flex-1 p-4 md:p-6 print:p-0 print:overflow-visible overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
