'use client';

import React, { useState } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface DownloadButtonProps {
  platform: 'windows' | 'linux-deb' | 'linux-appimage';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export default function DownloadButton({
  platform,
  variant = 'primary',
  className = '',
}: DownloadButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;

    setStatus('loading');
    setErrorMessage('');

    try {
      // dynamic call to Serverless redirect API (cache bypassed)
      const res = await fetch(`/api/download?platform=${platform}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Server returned ${res.status}`);
      }

      const data = await res.json();

      if (!data.url) {
        throw new Error('No download URL returned from resolver.');
      }

      // Transition to success and trigger download
      setStatus('success');
      
      // Perform direct browser redirection to start file download
      window.location.href = data.url;

      // Reset back to idle after a visual confirmation delay
      setTimeout(() => {
        setStatus('idle');
      }, 3500);

    } catch (err: any) {
      console.error(`Dynamic download failed for platform ${platform}:`, err);
      setStatus('error');
      setErrorMessage(err.message || 'GitHub resolution error.');

      // Reset back to idle after a delay so they can try again
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  // Label resolving mappings
  const getLabels = () => {
    if (status === 'loading') {
      return { text: 'Preparing download...', icon: Loader2 };
    }
    if (status === 'success') {
      return { text: 'Download starting!', icon: CheckCircle2 };
    }
    if (status === 'error') {
      return { text: errorMessage ? `Error: ${errorMessage}` : 'Resolution failed', icon: AlertCircle };
    }

    // Default Idle labels
    if (platform === 'windows') {
      return { text: 'Download for Windows', icon: Download };
    }
    if (platform === 'linux-deb') {
      return { text: 'Download Debian Installer (.deb)', icon: Download };
    }
    return { text: 'Download AppImage (.AppImage)', icon: Download };
  };

  const labels = getLabels();
  const Icon = labels.icon;

  // Visual Theme Mappings
  const baseClasses = 'w-full py-4 px-6 rounded-2xl font-extrabold text-center flex items-center justify-center gap-3 active:scale-[0.99] select-none cursor-pointer transition-all duration-300 shadow-md relative overflow-hidden focus:outline-none';
  
  let variantClasses = '';
  
  if (status === 'loading') {
    variantClasses = 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-500/15 cursor-wait';
  } else if (status === 'success') {
    variantClasses = 'bg-emerald-600 text-white hover:bg-emerald-600 shadow-emerald-500/10 border border-emerald-600 cursor-default';
  } else if (status === 'error') {
    variantClasses = 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/20 cursor-default';
  } else {
    // Standard Idle Variants
    if (variant === 'primary') {
      variantClasses = 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:scale-[1.01]';
    } else if (variant === 'secondary') {
      variantClasses = 'bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700/50 dark:border-slate-700 hover:scale-[1.01]';
    } else {
      // Outline Variant
      variantClasses = 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-850 dark:text-slate-100 border border-slate-300 dark:border-slate-800 hover:scale-[1.01]';
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'loading' || status === 'success'}
      className={`${baseClasses} ${variantClasses} ${className}`}
      type="button"
    >
      {/* Loading state has a spinning animation */}
      <Icon className={`h-5 w-5 shrink-0 ${status === 'loading' ? 'animate-spin' : ''}`} />
      <span className="truncate max-w-full text-sm sm:text-base tracking-tight font-black leading-none">
        {labels.text}
      </span>
      
      {/* Subtle bottom line loading animation */}
      {status === 'loading' && (
        <span className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500/20">
          <span className="block h-full bg-indigo-600 w-1/3 animate-shimmer-swipe shimmer"></span>
        </span>
      )}
    </button>
  );
}
