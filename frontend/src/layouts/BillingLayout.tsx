import React from 'react';

export function BillingLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Optics POS - New Billing Session</h2>
      </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {children}
      </main>
    </div>
  );
}

export default BillingLayout;
