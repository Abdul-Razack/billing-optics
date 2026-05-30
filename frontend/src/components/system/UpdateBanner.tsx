'use client';

import React, { useEffect, useState } from 'react';
import { DownloadCloud, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { fetchClient } from '@/lib/api-client';

export default function UpdateBanner() {
  const [status, setStatus] = useState<'IDLE' | 'AVAILABLE' | 'DOWNLOADING' | 'READY' | 'ERROR'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron) {
      const unsubAvailable = window.electron.onUpdateAvailable(() => setStatus('AVAILABLE'));
      
      const unsubProgress = window.electron.onUpdateProgress((info: any) => {
        setStatus('DOWNLOADING');
        setProgress(Math.round(info.percent || 0));
      });
      
      const unsubReady = window.electron.onUpdateReady(() => setStatus('READY'));
      
      const unsubError = window.electron.onUpdateError((err: string) => {
        setStatus('ERROR');
        setErrorMsg(err);
      });

      return () => {
        unsubAvailable();
        unsubProgress();
        unsubReady();
        unsubError();
      };
    }
  }, []);

  const handleInstall = async () => {
    try {
      setStatus('DOWNLOADING'); // Reuse this state to show a spinner
      // Try to backup the database before updating
      await fetchClient('/backups', { method: 'POST' });
    } catch (err) {
      console.warn('Backup failed before update, proceeding anyway...', err);
    }
    
    if (window.electron) {
      window.electron.installUpdate();
    }
  };

  const handleDismiss = () => {
    setStatus('IDLE');
  };

  if (status === 'IDLE') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all duration-300 ease-in-out">
      <div className="p-4 flex items-start gap-4">
        {status === 'AVAILABLE' && <DownloadCloud className="text-blue-500 w-6 h-6 flex-shrink-0 mt-1" />}
        {status === 'DOWNLOADING' && <RefreshCw className="text-blue-500 w-6 h-6 animate-spin flex-shrink-0 mt-1" />}
        {status === 'READY' && <DownloadCloud className="text-emerald-500 w-6 h-6 flex-shrink-0 mt-1" />}
        {status === 'ERROR' && <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0 mt-1" />}

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {status === 'AVAILABLE' && 'Update Available'}
            {status === 'DOWNLOADING' && 'Downloading Update...'}
            {status === 'READY' && 'Update Ready to Install'}
            {status === 'ERROR' && 'Update Failed'}
          </h4>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {status === 'AVAILABLE' && 'A new version is downloading in the background.'}
            {status === 'DOWNLOADING' && `${progress}% completed.`}
            {status === 'READY' && 'Restart the application to apply the latest features and security patches.'}
            {status === 'ERROR' && (errorMsg || 'There was a problem updating the application.')}
          </p>

          {status === 'DOWNLOADING' && (
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {status === 'READY' && (
            <button
              onClick={handleInstall}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              Restart & Install
            </button>
          )}
        </div>

        {(status === 'READY' || status === 'ERROR') && (
          <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
