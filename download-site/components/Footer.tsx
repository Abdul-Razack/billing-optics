import React from 'react';
import Link from 'next/link';
import { Glasses, Globe, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/40 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/20 py-12 relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/10">
                <Glasses className="h-5 w-5" />
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                Billing Optics ERP
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              A standalone public distribution registry for obtaining stable ERP desktop packages. Always keep your local optics retail store software updated to secure inventory registers and transactions.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/Abdul-Razack/billing-optics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="GitHub Repository"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Corporate Website"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Downloads
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Version History
                </Link>
              </li>
              <li>
                <Link href="/releases" className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Changelogs
                </Link>
              </li>
              <li>
                <Link href="/instructions" className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Setup Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal Links (With Future Prep hooks) */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Customer Hub
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-center space-x-1.5 opacity-40 cursor-not-allowed select-none">
                <span className="text-sm text-slate-500">Docs Portal</span>
                <span className="text-[8px] font-bold px-1 bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600 rounded">Soon</span>
              </li>
              <li className="flex items-center space-x-1.5 opacity-40 cursor-not-allowed select-none">
                <span className="text-sm text-slate-500">Support Desk</span>
                <span className="text-[8px] font-bold px-1 bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600 rounded">Soon</span>
              </li>
              <li className="flex items-center space-x-1.5 opacity-40 cursor-not-allowed select-none">
                <span className="text-sm text-slate-500">macOS Installer</span>
                <span className="text-[8px] font-bold px-1 bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600 rounded">Soon</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Security Advisory</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Billing Optics. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1.5">
            <span>Powered by Vercel & GitHub API</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
