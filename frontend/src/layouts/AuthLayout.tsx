import React from 'react';

export function AuthLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-lg p-8">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
