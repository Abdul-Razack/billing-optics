'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Database, ShieldAlert, PlayCircle, Download, FileText, CheckCircle, ArrowRight } from 'lucide-react';

export default function SetupInstructions() {
  const [activeGuide, setActiveGuide] = useState<'fresh' | 'upgrade' | 'backup'>('fresh');

  const categories = [
    { id: 'fresh', name: 'Fresh Installation', icon: Compass, desc: 'Setup from scratch' },
    { id: 'upgrade', name: 'Software Upgrades', icon: PlayCircle, desc: 'Migrate to latest build' },
    { id: 'backup', name: 'Critical Database Backup', icon: Database, desc: 'Secure retail ledgers' },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* Page Header */}
      <section className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <Compass className="h-8 w-8 text-indigo-500" />
          Setup & Deployment Guides
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
          Comprehensive operations checklists to successfully deploy, migrate, or secure your Billing Optics POS platform nodes.
        </p>
      </section>

      {/* Grid tabs selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeGuide === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveGuide(cat.id as any)}
              className={`glass-panel rounded-2xl p-5 text-left border flex flex-col justify-between items-start gap-4 transition-all duration-300 hover:scale-[1.01] ${
                isSelected
                  ? 'border-indigo-500/30 bg-indigo-600/5 dark:bg-indigo-500/10 shadow-sm'
                  : 'hover:border-slate-300 dark:hover:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2.5 rounded-xl border ${
                  isSelected
                    ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200/50 dark:border-slate-800/60'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className={`text-sm font-bold ${
                  isSelected ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-semibold">
                  {cat.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Guide details board */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 hover:border-indigo-500/10 transition-all duration-500">
        
        {/* FRESH GUIDE */}
        {activeGuide === 'fresh' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-950 dark:text-slate-50 border-b border-slate-200/60 dark:border-slate-800 pb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-indigo-500" />
              Fresh Installation Guide
            </h2>
            
            <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-350">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600/10 text-indigo-600 text-xs font-black">1</span>
                  Obtain Desktop Package
                </h3>
                <p className="pl-7">
                  Visit our <Link href="/" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">homepage</Link> and select the appropriate package for your computer. Windows environments should run the `.exe` setup package. Linux users can select the universal standalone `.AppImage`.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600/10 text-indigo-600 text-xs font-black">2</span>
                  Execute Installer
                </h3>
                <div className="pl-7 space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Windows Launch:</h4>
                    <p className="mt-0.5">Double-click the downloaded setup package `Billing Optics ERP Setup.exe`. If asked by User Account Control (UAC), approve the prompt. The package installs desktop shortcuts and launches instantly.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Linux AppImage Launch:</h4>
                    <p className="mt-0.5">Open a terminal in the folder containing the `.AppImage` file and run:
                      <code className="block font-mono bg-slate-100 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800 mt-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                        chmod +x Billing_Optics_ERP-1.0.0.AppImage<br/>
                        ./Billing_Optics_ERP-1.0.0.AppImage
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600/10 text-indigo-600 text-xs font-black">3</span>
                  Connect Database Ledger
                </h3>
                <p className="pl-7">
                  Upon startup, open the configuration page to connect to your central PostgreSQL node. Provide the hostname, port, database name, and admin credentials. The software will automatically check connections, initialize required schemas using Drizzle, and mount the retail billing grids.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* UPGRADE GUIDE */}
        {activeGuide === 'upgrade' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-950 dark:text-slate-50 border-b border-slate-200/60 dark:border-slate-800 pb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-indigo-500" />
              Upgrading Software
            </h2>
            
            <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-350">
              <div className="p-4 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 flex gap-3 text-xs sm:text-sm text-indigo-800 dark:text-indigo-300">
                <ShieldAlert className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div>
                  <span className="font-bold">Prioritize Safeguards:</span> Make sure to run a database backup before updating software packages. While updates preserve tables, system sync safeguards should always be prioritised to prevent billing record dropouts.
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Windows Upgrades
                </h3>
                <p className="pl-4">
                  1. Fully close the active desktop application.<br/>
                  2. Obtain the latest `.exe` setup package from our homepage.<br/>
                  3. Run the setup package. The built-in NSIS builder automatically detects existing installations, stops active processes, overrides dependencies, and updates the version tag while preserving local configuration states.
                </p>
              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/40 pt-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Linux AppImage Upgrades
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                  The AppImage version seamlessly updates itself securely in the background. No manual downloads or terminal commands are necessary.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BACKUP GUIDE */}
        {activeGuide === 'backup' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 border-b border-slate-200/60 dark:border-slate-800 pb-3 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500 animate-bounce" />
              Critical Database Backup Protocol
            </h2>
            
            <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-350">
              <p className="font-semibold">
                Billing Optics ERP stores inventory, patient prescriptions, invoices, and payment logs in a PostgreSQL database. Loss of this data can disrupt retail operations. Always dump database states before executing updates!
              </p>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-rose-600/10 text-rose-500 text-xs font-black">1</span>
                  Create Command Line SQL Dump
                </h3>
                <p className="pl-7">
                  Access your primary PostgreSQL host terminal (or run locally if self-hosting PostgreSQL) and issue the `pg_dump` sequence to write a schema + data snapshot:
                  <code className="block font-mono bg-slate-100 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800 mt-1.5 text-xs text-rose-600 dark:text-rose-400 overflow-x-auto">
                    pg_dump -U [user_name] -d optics_pos -F c -b -v -f /backups/optics_pos_pre_upgrade.backup
                  </code>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-rose-600/10 text-rose-500 text-xs font-black">2</span>
                  Backup Local Desktop Settings
                </h3>
                <p className="pl-7">
                  Local cache configurations, database connections, and layout preferences are stored in user app folders. Copy these locations to a secure location:
                </p>
                <div className="pl-7 space-y-2.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400">Windows File Path:</span>
                    <code className="block font-mono bg-slate-100 dark:bg-slate-900 p-1.5 rounded mt-0.5 text-slate-700 dark:text-slate-350">%APPDATA%\billing-optics-erp\config.json</code>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400">Linux File Path:</span>
                    <code className="block font-mono bg-slate-100 dark:bg-slate-900 p-1.5 rounded mt-0.5 text-slate-700 dark:text-slate-350">~/.config/billing-optics-erp/config.json</code>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-rose-600/10 text-rose-500 text-xs font-black">3</span>
                  Deploy to Safe Offline Media
                </h3>
                <p className="pl-7">
                  Store exported backup records in a secondary storage system, external hard drive, or secure cloud backup directory before running updates. This ensures you can restore business databases in minutes if any driver failures occur.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
      
    </div>
  );
}
