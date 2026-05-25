import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OfflineBanner(): JSX.Element | null {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      toast.error('Connection lost. Operating in offline mode.');
    };
    
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Connection restored. Syncing offline data...');
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-top-4 duration-300">
      <WifiOff className="text-amber-600" size={16} />
      <span className="text-amber-800 text-sm font-medium">
        You are currently offline. Changes will be saved locally and synced when connection is restored.
      </span>
    </div>
  );
}
