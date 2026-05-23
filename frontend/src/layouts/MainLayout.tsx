import React from 'react';

export function MainLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Optics POS Dashboard</h2>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

export default MainLayout;
