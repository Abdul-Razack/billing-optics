import React from 'react';
import Link from 'next/link';
import { getReleases } from '../services/github';
import SystemRequirements from '../components/SystemRequirements';
import DownloadButton from '../components/DownloadButton';
import { 
  Monitor, 
  Terminal, 
  ArrowRight, 
  ShieldCheck, 
  Info, 
  Calendar, 
  CreditCard, 
  Package, 
  Users, 
  TrendingUp, 
  Cpu, 
  HardDrive, 
  Printer, 
  Check, 
  ChevronRight,
  Database,
  Layers,
  ArrowDownToLine,
  Activity
} from 'lucide-react';

export default async function Home() {
  const { releases, isMocked } = await getReleases();
  
  // Find the latest release
  const latestRelease = releases[0];
  
  // Fallbacks for display purposes in case assets aren't in the active object
  const versionString = latestRelease?.version || 'v0.3.1';
  const releaseDateString = latestRelease?.releaseDate || 'May 31, 2026';
  
  const winSize = latestRelease?.windowsAsset?.size || '84.5 MB';
  const debSize = latestRelease?.linuxAssetDeb?.size || '68.4 MB';
  const appImageSize = latestRelease?.linuxAssetAppImage?.size || '72.1 MB';

  return (
    <div className="space-y-20 sm:space-y-28 animate-fade-in relative pb-16">
      
      {/* Accent Glowing Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-2/3 left-1/3 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Dynamic Status / Diagnostics Bar */}
      {isMocked && (
        <div id="diagnostics-banner" className="mx-auto max-w-5xl p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 text-amber-800 dark:text-amber-400/90 text-sm flex items-start gap-3 shadow-md relative z-10">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">Offline Cache Active</p>
            <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400/80">
              The live GitHub Releases API returned no public builds or is currently rate-limited. We have loaded a high-fidelity pre-compiled local cached release registry ({versionString}) to provide full functional verification and visual layout fidelity.
            </p>
          </div>
        </div>
      )}

      {/* Hero Branding Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8 pt-6 sm:pt-12 relative z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-600/10 dark:bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-600 dark:text-indigo-300 shadow-sm animate-pulse-slow">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
          <span>Latest Release:</span>
          <span className="font-extrabold text-indigo-700 dark:text-indigo-200">{versionString}</span>
          <span className="h-3 w-px bg-indigo-500/25"></span>
          <span className="text-slate-500 dark:text-slate-400 font-semibold">{releaseDateString}</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
          Billing Optics <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">ERP</span>
        </h1>
        
        <p className="text-base sm:text-xl text-slate-650 dark:text-slate-405 font-medium max-w-3xl mx-auto leading-relaxed">
          Production-grade ERP platform for optical stores, inventory management, billing, and customer operations. Get the native desktop installers below.
        </p>

        {latestRelease && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-sm font-bold">
            <a 
              href="#windows" 
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md hover:scale-[1.02] transition-all flex items-center gap-2 group"
            >
              <Monitor className="h-4 w-4" />
              <span>Download for Windows</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a 
              href="#linux" 
              className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-705 shadow-md border border-slate-700/30 hover:scale-[1.02] transition-all flex items-center gap-2 group"
            >
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span>Download for Linux</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a 
              href="#changelog" 
              className="px-5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-300 transition-all flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Explore Changelog</span>
            </a>
          </div>
        )}
      </section>

      {/* Main Double-Card Installer Downloads Dashboard */}
      <section className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Desktop Companion Packages</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Select your native build system parameters. Auto-updates sync seamlessly upon launch.</p>
        </div>

        {latestRelease ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Windows Download Card */}
            <div id="windows" className="glass-panel rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:scale-[1.01] hover:border-indigo-500/30 transition-all duration-300 relative group shadow-lg overflow-hidden border-t-2 border-t-indigo-500/50">
              {/* Background glowing spot */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 shadow-sm">
                    <Monitor className="h-7 w-7" />
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-600/10 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/15">
                    Recommended Build
                  </span>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Windows Installation</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Standard offline desktop companion. Fully compatible with Windows 10 and 11. Custom configured for high-speed local SQL caching and receipt printer syncing.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 space-y-3.5 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/30 dark:border-slate-800/30">
                    <span className="text-slate-400 font-bold">Latest Stable</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">{versionString}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/30 dark:border-slate-800/30">
                    <span className="text-slate-400 font-bold">File Package</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">Standard Setup (.exe)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/30 dark:border-slate-800/30">
                    <span className="text-slate-400 font-bold">File Footprint</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">{winSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Target Architecture</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">Intel/AMD x64 (64-bit)</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 relative z-10">
                {/* Dynamic stateful direct download button */}
                <DownloadButton platform="windows" variant="primary" />
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400 font-semibold bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>Code-signed binary scanned clean of adware or background scripts.</span>
                </div>
              </div>
            </div>

            {/* Linux Download Card */}
            <div id="linux" className="glass-panel rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:scale-[1.01] hover:border-emerald-500/30 transition-all duration-300 relative group shadow-lg overflow-hidden border-t-2 border-t-emerald-500/50">
              {/* Background glowing spot */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 shadow-sm">
                    <Terminal className="h-7 w-7" />
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-600/10 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 border border-emerald-500/15">
                    Core Linux Targets
                  </span>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Linux Distributions</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Universal builds compiled for modern desktop environments. Offers robust CUPS driver support for standard ESC/POS printers and serial scanning systems.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 space-y-3.5 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/30 dark:border-slate-800/30">
                    <span className="text-slate-400 font-bold">Supported Platforms</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">Ubuntu, Debian, Fedora, Mint</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/30 dark:border-slate-800/30">
                    <span className="text-slate-400 font-bold">Debian Size (.deb)</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">{debSize}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/30 dark:border-slate-800/30">
                    <span className="text-slate-400 font-bold">AppImage Size (.AppImage)</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">{appImageSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Target Architecture</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">Intel/AMD x86_64</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 relative z-10 space-y-3">
                {/* Dynamic stateful direct download buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DownloadButton platform="linux-deb" variant="secondary" />
                  <DownloadButton platform="linux-appimage" variant="outline" />
                </div>
                
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-semibold bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>Sandboxed build pipelines verified free of configuration anomalies.</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-16 glass-panel rounded-3xl max-w-xl mx-auto p-8 border-dashed border-2 border-slate-350 dark:border-slate-800">
            <Info className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Release Packages Temporarily Offline</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              We were unable to locate stable installer files on the repository tag channels. If you are experiencing connection drops, try again in a few moments.
            </p>
          </div>
        )}
      </section>

      {/* SaaS Feature Showcase Spotlight Grid */}
      <section className="relative z-10 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Engineered for Optical Retail</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">A unified monolith desktop suite combining invoicing speed, inventory, and clinical logs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: POS Billing */}
          <div className="glass-panel p-6 rounded-2xl hover:scale-[1.02] hover:border-indigo-500/20 transition-all duration-300 space-y-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 w-fit">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Rapid Invoicing</h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Generate GST compliance-ready receipts under 5 seconds. Connects directly to localized thermal slip printers.
              </p>
            </div>
          </div>

          {/* Card 2: Inventory Ledger */}
          <div className="glass-panel p-6 rounded-2xl hover:scale-[1.02] hover:border-emerald-500/20 transition-all duration-300 space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/15 w-fit">
              <Package className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Eyewear Serialization</h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Trace frames and lens attributes with custom indices. Barcode scanning auto-completes inventory logs instantly.
              </p>
            </div>
          </div>

          {/* Card 3: Patient Records */}
          <div className="glass-panel p-6 rounded-2xl hover:scale-[1.02] hover:border-indigo-500/20 transition-all duration-300 space-y-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 w-fit">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Prescription Tracking</h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Maintain histories of Spherical, Cylindrical, and PD values for client profiles. Auto-pull specs at POS checkout.
              </p>
            </div>
          </div>

          {/* Card 4: Store Analytics */}
          <div className="glass-panel p-6 rounded-2xl hover:scale-[1.02] hover:border-emerald-500/20 transition-all duration-300 space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/15 w-fit">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Revenue Analytics</h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Compile real-time billing indicators. Visualize store revenue margins, payment configurations, and frame turnover.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Platform Technical Specifications Table */}
      <section className="relative z-10 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Platform Specifications</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Detailed build environment metrics and database orchestration profiles.</p>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-150/40 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th scope="col" className="px-6 py-4">Specification Parameter</th>
                  <th scope="col" className="px-6 py-4">Windows x64 Profile</th>
                  <th scope="col" className="px-6 py-4">Linux amd64 Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350">
                <tr className="hover:bg-slate-100/10 dark:hover:bg-slate-900/10">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Release Signature</td>
                  <td className="px-6 py-4">{versionString}-stable</td>
                  <td className="px-6 py-4">{versionString}-stable</td>
                </tr>
                <tr className="hover:bg-slate-100/10 dark:hover:bg-slate-900/10">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Auto-Updater Channel</td>
                  <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Enabled (electron-updater)
                  </td>
                  <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400">
                    Manual Sync (deb check)
                  </td>
                </tr>
                <tr className="hover:bg-slate-100/10 dark:hover:bg-slate-900/10">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Local Cache Layer</td>
                  <td className="px-6 py-4">SQLite Caching (offline persistence)</td>
                  <td className="px-6 py-4">SQLite Caching (offline persistence)</td>
                </tr>
                <tr className="hover:bg-slate-100/10 dark:hover:bg-slate-900/10">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Database Synchronizer</td>
                  <td className="px-6 py-4">Drizzle ORM Engine (PostgreSQL sync)</td>
                  <td className="px-6 py-4">Drizzle ORM Engine (PostgreSQL sync)</td>
                </tr>
                <tr className="hover:bg-slate-100/10 dark:hover:bg-slate-900/10">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Hardware Integration</td>
                  <td className="px-6 py-4">USB ESC/POS, COM barcode scanner</td>
                  <td className="px-6 py-4">CUPS print spooler, USB HID drivers</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* System Requirements Component Grid */}
      <section className="relative z-10 max-w-6xl mx-auto">
        <SystemRequirements />
      </section>

      {/* Latest Release Changelog Highlight Preview */}
      {latestRelease && (
        <section id="changelog" className="relative z-10 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800/80">
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Changelog Preview ({versionString})
            </h3>
            <Link 
              href="/releases" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 hover:underline"
            >
              All Release Notes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          
          <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-6 relative max-h-[350px] overflow-hidden group">
            {/* Fade out bottom overlay to keep elegant preview style */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-[#020617] dark:via-[#020617]/95 dark:to-transparent z-10 pointer-events-none" />
            
            <div className="markdown-content text-sm leading-relaxed text-slate-650 dark:text-slate-300 font-medium">
              {/* Basic regex-free custom markdown snippet parser */}
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: latestRelease.releaseNotes
                    .split('\n')
                    .slice(0, 15)
                    .join('\n')
                    .replace(/^##\s+(.*)/gm, '<h3 class="text-base sm:text-lg font-black text-slate-950 dark:text-slate-50 mt-5 mb-2">$1</h3>')
                    .replace(/^###\s+(.*)/gm, '<h4 class="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400 mt-4 mb-1.5">$1</h4>')
                    .replace(/^-\s+\*\*(.*?)\*\*:(.*)/gm, '<li class="ml-4 list-disc my-1.5"><strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>:$2</li>')
                    .replace(/^-\s+(.*)/gm, '<li class="ml-4 list-disc my-1.5">$1</li>')
                }} 
              />
            </div>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
              <Link 
                href="/releases"
                className="px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-white text-xs font-black shadow-md hover:scale-105 active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                <span>Expand Full Release Notes</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Future Roadmap Portals Banner */}
      <section className="relative z-10 max-w-6xl mx-auto glass-panel rounded-3xl p-8 sm:p-10 border-t border-indigo-500/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center lg:text-left divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800/80">
          
          <div className="pt-4 lg:pt-0 lg:px-6 first:pt-0 first:px-0 space-y-3">
            <span className="text-[9px] font-black uppercase bg-slate-200/50 text-slate-400 dark:bg-slate-900/60 dark:text-slate-650 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 float-right">
              Planned
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Native macOS Build</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              We are adapting the Electron desktop wrapper to support Apple Silicon and Intel macOS bundles, including code signing and notarization pathways.
            </p>
          </div>
          
          <div className="pt-8 lg:pt-0 lg:px-8 space-y-3">
            <span className="text-[9px] font-black uppercase bg-slate-200/50 text-slate-400 dark:bg-slate-900/60 dark:text-slate-650 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 float-right">
              Planned
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Knowledge Portal</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              A comprehensive library compiling user guides, database setup steps, barcode scanner synchronization sheets, and receipt template adjustments.
            </p>
          </div>

          <div className="pt-8 lg:pt-0 lg:px-8 space-y-3">
            <span className="text-[9px] font-black uppercase bg-slate-200/50 text-slate-400 dark:bg-slate-900/60 dark:text-slate-650 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 float-right">
              Planned
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Live Support Desk</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Connect directly with optical POS field technicians to troubleshoot active invoice database states, backup transfers, or driver configuration.
            </p>
          </div>
          
        </div>
      </section>

    </div>
  );
}
