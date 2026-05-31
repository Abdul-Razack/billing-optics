'use client';

import React, { useState } from 'react';
import { Cpu, HardDrive, Monitor, Printer, RefreshCw, Terminal, Layers } from 'lucide-react';

export default function SystemRequirements() {
  const [activeTab, setActiveTab] = useState<'windows' | 'linux'>('windows');

  const specs = {
    windows: [
      { name: 'Operating System', icon: Monitor, value: 'Windows 10 / 11 (64-bit Home, Pro, or Enterprise)' },
      { name: 'Processor (CPU)', icon: Cpu, value: 'Intel Core i3 / AMD Ryzen 3 or higher (Dual-Core 2.0 GHz+)' },
      { name: 'System Memory (RAM)', icon: Layers, value: '4 GB Minimum (8 GB Recommended for seamless operation)' },
      { name: 'Storage Capacity', icon: HardDrive, value: '500 MB free space (SSD strongly recommended for local caching)' },
      { name: 'Display & Graphics', icon: Terminal, value: '1366 × 768 Resolution minimum (1920 × 1080 Optimized)' },
      { name: 'POS Peripherals', icon: Printer, value: 'USB/Network 80mm ESC/POS Thermal Printers & standard Barcode Scanners' },
    ],
    linux: [
      { name: 'Operating System', icon: Monitor, value: 'Ubuntu 20.04+, Debian 11+, Fedora 36+, or compatible Linux distribution' },
      { name: 'Processor (CPU)', icon: Cpu, value: 'Intel Core i3 / AMD Ryzen 3 or higher (Dual-Core 2.0 GHz+)' },
      { name: 'System Memory (RAM)', icon: Layers, value: '4 GB Minimum (8 GB Recommended)' },
      { name: 'Storage Capacity', icon: HardDrive, value: '500 MB free space (SSD recommended)' },
      { name: 'Display & Graphics', icon: Terminal, value: '1366 × 768 Resolution minimum (X11 or Wayland display server)' },
      { name: 'POS Peripherals', icon: Printer, value: 'CUPS compatible 80mm thermal receipt printer, USB HID barcode scanner support' },
    ]
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 hover:border-indigo-500/20 transition-all duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-indigo-500" />
            System Requirements
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ensure your local computer meets these specifications before launching the POS platform.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl mt-4 sm:mt-0 border border-slate-200/50 dark:border-slate-800/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('windows')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
              activeTab === 'windows'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm border border-slate-200/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            Windows
          </button>
          <button
            onClick={() => setActiveTab('linux')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
              activeTab === 'linux'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm border border-slate-200/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            Linux Distros
          </button>
        </div>
      </div>

      {/* Grid of specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {specs[activeTab].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/30 dark:bg-slate-900/20 border border-slate-200/30 dark:border-slate-800/30 hover:bg-white/50 dark:hover:bg-slate-900/30 transition-colors"
            >
              <div className="p-3 rounded-xl bg-indigo-600/5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-500/10">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {item.name}
                </h4>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auxiliary Warning Badge */}
      <div className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-amber-800 dark:text-amber-300 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <span className="mt-0.5 select-none text-base">⚠️</span>
        <div>
          <span className="font-bold">Hardware Note: </span>
          Both Windows and Linux targets require an active USB/COM connection for barcode scanners. High-volume stores should run the backend on a dedicated localized system, or link to a cloud container using a stable optical high-speed broadband network connection.
        </div>
      </div>
    </div>
  );
}
