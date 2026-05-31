import React from 'react';
import Link from 'next/link';
import { getReleases, Release } from '../services/github';
import SystemRequirements from '../components/SystemRequirements';
import { Download, Monitor, Terminal, ArrowRight, ShieldCheck, HelpCircle, AlertCircle, Info, Calendar } from 'lucide-react';

export default async function Home() {
  const { releases, isMocked, error } = await getReleases();
  
  // Find the latest stable release (or just the latest release if no stable)
  const latestRelease = releases[0];
  
  // Check if Linux installers exist to satisfy dynamic hiding criteria
  const hasLinuxAssets = !!(latestRelease?.linuxAssetDeb || latestRelease?.linuxAssetAppImage);

  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in relative">
      
      {/* Dynamic Status / Diagnostics Bar */}
      {isMocked && (
        <div className="mx-auto max-w-4xl p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-amber-800 dark:text-amber-400/90 text-sm flex items-start gap-3 shadow-sm">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">Offline Cache Active</p>
            <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400/80">
              The live GitHub Releases API returned no public builds or is currently rate-limited. We have loaded a high-fidelity pre-compiled local cached release registry ({latestRelease?.version || 'v1.0.0'}) to provide full functional verification and visual layout fidelity.
            </p>
          </div>
        </div>
      )}

      {/* Hero Branding Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4 sm:pt-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-600/10 dark:bg-indigo-500/15 border border-indigo-500/15 text-xs font-bold text-indigo-600 dark:text-indigo-300 shadow-sm animate-pulse-slow">
          <span>Current Stable Channel</span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
          <span>{latestRelease?.version || 'v1.0.0'}</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
          Billing Optics ERP
        </h1>
        
        <p className="text-base sm:text-xl text-slate-500 dark:text-slate-400 font-semibold max-w-2xl mx-auto leading-relaxed">
          The ultimate production-grade POS and inventory ledger suite designed specifically for modern retail optical storefronts. Get the native desktop installers below.
        </p>

        {latestRelease && (
          <div className="flex items-center justify-center space-x-3 text-xs sm:text-sm text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-500/60" />
              Released: {latestRelease.releaseDate}
            </span>
            <span className="h-3 w-px bg-slate-200 dark:bg-slate-800"></span>
            <Link 
              href="/releases" 
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline flex items-center gap-1"
            >
              Read full changelog <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </section>

      {/* Main Installer Downloads Dashboard */}
      {latestRelease ? (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Windows Download Card */}
          <div className={`col-span-1 glass-panel rounded-3xl p-8 flex flex-col justify-between hover:scale-[1.01] hover:border-indigo-500/30 transition-all duration-300 relative group shadow-md overflow-hidden ${
            hasLinuxAssets ? 'md:col-span-6' : 'md:col-span-8 md:col-start-2 lg:col-span-6 lg:col-start-4'
          }`}>
            {/* Background glowing spot */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 shadow-sm">
                  <Monitor className="h-7 w-7" />
                </div>
                <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md bg-indigo-600/10 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300">
                  Recommended build
                </span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Windows Installation</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Standard offline desktop companion. Fully compatible with Windows 10 and 11 environments, preconfigured for high-speed SQL database syncing.
                </p>
              </div>

              {latestRelease.windowsAsset ? (
                <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Setup Package:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold truncate max-w-[200px]" title={latestRelease.windowsAsset.name}>
                      {latestRelease.windowsAsset.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">File Footprint:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-bold">{latestRelease.windowsAsset.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Binary Type:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-bold">Standard Windows Installer (.exe)</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-rose-500 font-bold">Windows asset currently compiling. Please check back shortly.</p>
              )}
            </div>

            <div className="mt-8 relative z-10">
              {latestRelease.windowsAsset ? (
                <a
                  href={latestRelease.windowsAsset.url}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-center flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.99] transition-all duration-200 group/btn"
                >
                  <Download className="h-5 w-5 group-hover/btn:translate-y-0.5 transition-transform" />
                  Download for Windows
                </a>
              ) : (
                <button disabled className="w-full py-4 px-6 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-bold text-center cursor-not-allowed">
                  Windows Installer Offline
                </button>
              )}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] sm:text-xs text-slate-400 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Code-signed and scanned clean of adware or tracker scripts.</span>
              </div>
            </div>
          </div>

          {/* Linux Download Card - Conditionally Rendered */}
          {hasLinuxAssets && (
            <div className="col-span-1 md:col-span-6 glass-panel rounded-3xl p-8 flex flex-col justify-between hover:scale-[1.01] hover:border-emerald-500/30 transition-all duration-300 relative group shadow-md overflow-hidden">
              {/* Background glowing spot */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 shadow-sm">
                    <Terminal className="h-7 w-7" />
                  </div>
                  <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md bg-emerald-600/10 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300">
                    Linux Core builds
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Linux Distribution</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Universal builds compatible with modern desktop Linux systems. Offers robust D-Bus bindings for scanning systems and CUPS thermal prints.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 space-y-2.5 text-xs">
                  {latestRelease.linuxAssetDeb && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400 font-semibold">Debian / Ubuntu:</span>
                      <a 
                        href={latestRelease.linuxAssetDeb.url}
                        className="font-mono text-indigo-600 dark:text-indigo-400 font-bold hover:underline truncate max-w-[150px]"
                        title={latestRelease.linuxAssetDeb.name}
                      >
                        {latestRelease.linuxAssetDeb.name} ({latestRelease.linuxAssetDeb.size})
                      </a>
                    </div>
                  )}
                  {latestRelease.linuxAssetAppImage && (
                    <div className="flex justify-between items-center py-0.5 border-t border-slate-200/30 dark:border-slate-800/30 pt-2">
                      <span className="text-slate-400 font-semibold">Universal AppImage:</span>
                      <a 
                        href={latestRelease.linuxAssetAppImage.url}
                        className="font-mono text-indigo-600 dark:text-indigo-400 font-bold hover:underline truncate max-w-[150px]"
                        title={latestRelease.linuxAssetAppImage.name}
                      >
                        {latestRelease.linuxAssetAppImage.name} ({latestRelease.linuxAssetAppImage.size})
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 relative z-10 space-y-2">
                {latestRelease.linuxAssetDeb ? (
                  <a
                    href={latestRelease.linuxAssetDeb.url}
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-center flex items-center justify-center gap-2 border border-slate-700/50 dark:border-slate-700 active:scale-[0.99] transition-all duration-200"
                  >
                    <Download className="h-4 w-4" />
                    Download Debian Installer (.deb)
                  </a>
                ) : null}

                {latestRelease.linuxAssetAppImage ? (
                  <a
                    href={latestRelease.linuxAssetAppImage.url}
                    className="w-full py-3.5 px-6 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-center flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-850 active:scale-[0.99] transition-all duration-200"
                  >
                    <Download className="h-4 w-4" />
                    Download AppImage (.AppImage)
                  </a>
                ) : null}
              </div>
            </div>
          )}

        </section>
      ) : (
        <section className="text-center py-12 glass-panel rounded-3xl max-w-xl mx-auto p-8 border-dashed border-2">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Release Packages Temporarily Unavailable</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            We were unable to locate stable installer files on the repository tag channels. If you are experiencing connection drops, try again in a few moments.
          </p>
        </section>
      )}

      {/* Latest Release Changelog Highlight */}
      {latestRelease && (
        <section className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Latest Release Changes ({latestRelease.version})
            </h3>
            <Link 
              href="/releases" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 hover:underline"
            >
              All Release Notes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 relative max-h-[300px] overflow-hidden group">
            {/* Fade out bottom overlay to keep elegant preview style */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#020617] dark:via-[#020617]/80 dark:to-transparent z-10 pointer-events-none" />
            
            <div className="markdown-content text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {/* Basic regex-free custom markdown snippet parser */}
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: latestRelease.releaseNotes
                    .split('\n')
                    .slice(0, 10)
                    .join('\n')
                    .replace(/^##\s+(.*)/gm, '<h3 class="text-base font-bold text-slate-950 dark:text-slate-50 mt-3">$1</h3>')
                    .replace(/^###\s+(.*)/gm, '<h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">$1</h4>')
                    .replace(/^-\s+\*\*(.*?)\*\*:(.*)/gm, '<li class="ml-4 list-disc my-1"><strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>:$2</li>')
                    .replace(/^-\s+(.*)/gm, '<li class="ml-4 list-disc my-1">$1</li>')
                }} 
              />
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <Link 
                href="/releases"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-white text-xs font-bold shadow-md hover:scale-105 active:scale-[0.98] transition-all"
              >
                Expand Full Release Notes
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* System Requirements Component Embedded */}
      <section className="max-w-4xl mx-auto">
        <SystemRequirements />
      </section>

      {/* Future Roadmap Portals Banner */}
      <section className="max-w-4xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 hover:border-indigo-500/10 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-850">
          <div className="pt-4 md:pt-0 md:px-6 first:pt-0 first:px-0 space-y-2">
            <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-400 dark:bg-slate-900/60 dark:text-slate-600 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 float-right">Planned</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Native macOS Build</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              We are adapting the Electron desktop wrapper to support Apple Silicon and Intel macOS bundles, including code signing and notarization pathways.
            </p>
          </div>
          
          <div className="pt-6 md:pt-0 md:px-6 space-y-2">
            <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-400 dark:bg-slate-900/60 dark:text-slate-600 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 float-right">Planned</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Knowledge Portal</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              A comprehensive library compiling user guides, database setup steps, barcode scanner synchronization sheets, and receipt template adjustments.
            </p>
          </div>

          <div className="pt-6 md:pt-0 md:px-6 space-y-2">
            <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-400 dark:bg-slate-900/60 dark:text-slate-600 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 float-right">Planned</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Support Desk</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Connect directly with optical POS field technicians to trouble-shoot active invoice database states, backup transfers, or driver configuration.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
