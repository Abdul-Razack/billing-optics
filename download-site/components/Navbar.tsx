'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, X, Glasses, BookOpen, HelpCircle, HardDrive } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent FOUC and ensure the client matches the theme safely
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Version History', href: '/history' },
    { name: 'Release Notes', href: '/releases' },
    { name: 'Installation Guide', href: '/instructions' },
  ];

  const futureLinks = [
    { name: 'macOS Build', icon: HardDrive, badge: 'Soon' },
    { name: 'Documentation', icon: BookOpen, badge: 'Soon' },
    { name: 'Support Portal', icon: HelpCircle, badge: 'Soon' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-nav w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/15 group-hover:scale-105 transition-all duration-300 shadow-sm">
                <Glasses className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-slate-50">
                  Billing Optics
                </span>
                <span className="text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                  ERP Download Center
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/50 dark:text-slate-300 dark:hover:text-indigo-300 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons (Theme switcher, mobile burger) */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                type="button"
                className="p-2.5 rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-all duration-200 focus:outline-none hover:scale-105 active:scale-95 shadow-sm"
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-5 w-5 animate-pulse-slow" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="md:hidden p-2.5 rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-r-0 border-l-0 border-t-0 animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-1.5 shadow-inner">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/50 dark:text-slate-300 dark:hover:text-indigo-300 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="border-t border-slate-200 dark:border-slate-800/60 my-3 pt-3">
              <span className="px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Future Integrations
              </span>
              <div className="mt-2 space-y-1">
                {futureLinks.map((link) => (
                  <div
                    key={link.name}
                    className="flex items-center justify-between px-4 py-2 rounded-xl text-slate-400 dark:text-slate-500 text-sm font-semibold select-none cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-2">
                      <link.icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900/60 dark:text-slate-600 border border-slate-200 dark:border-slate-800">
                      {link.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
