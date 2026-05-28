import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
